"use server";

import { redirect } from "next/navigation";

import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  uploadUserAvatar,
  validateAvatarFile,
} from "@/services/profile/avatar.service";

export type AuthActionState = {
  ok: boolean;
  message?: string;
};

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function signInAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  if (!email || !password) {
    return {
      ok: false,
      message: "Informe email e senha.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure as variaveis do Supabase para ativar o acesso.",
    };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return {
      ok: false,
      message: "Email ou senha invalidos.",
    };
  }

  redirect("/dashboard");
}

export async function signUpAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const name = getString(formData, "name");
  const email = getString(formData, "email");
  const password = getString(formData, "password");
  const avatar = validateAvatarFile(formData.get("avatar"));

  if (avatar.error) {
    return { ok: false, message: avatar.error };
  }

  if (!name || !email || !password) {
    return {
      ok: false,
      message: "Preencha nome, email e senha.",
    };
  }

  if (password.length < 6) {
    return {
      ok: false,
      message: "A senha deve ter pelo menos 6 caracteres.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure as variaveis do Supabase para ativar o cadastro.",
    };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${getSiteUrl()}/auth/confirm`,
    },
  });

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  let message = "Cadastro criado. Verifique seu email para confirmar o acesso.";

  if (avatar.file && data.session && data.user) {
    const uploadedAvatar = await uploadUserAvatar(supabase, data.user.id, avatar.file);

    if (uploadedAvatar.path) {
      await supabase
        .from("profiles")
        .update({ avatar_path: uploadedAvatar.path })
        .eq("id", data.user.id);
    } else {
      message =
        "Cadastro criado. Sua foto poderá ser adicionada depois em Configurações.";
    }
  } else if (avatar.file) {
    message =
      "Cadastro criado. Confirme seu email e depois adicione sua foto em Configurações.";
  }

  return {
    ok: true,
    message,
  };
}

export async function recoverPasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = getString(formData, "email");

  if (!email) {
    return {
      ok: false,
      message: "Informe seu email.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure as variaveis do Supabase para recuperar senha.",
    };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  return {
    ok: true,
    message: "Enviamos as instrucoes para seu email.",
  };
}

export async function updatePasswordAction(
  _state: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = getString(formData, "password");
  const confirmation = getString(formData, "confirmation");

  if (password.length < 6) {
    return {
      ok: false,
      message: "A senha deve ter pelo menos 6 caracteres.",
    };
  }

  if (password !== confirmation) {
    return {
      ok: false,
      message: "As senhas nao conferem.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure as variaveis do Supabase para alterar senha.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return {
      ok: false,
      message: error.message,
    };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase?.auth.signOut();
  redirect("/login");
}
