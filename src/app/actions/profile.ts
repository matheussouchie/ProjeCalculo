"use server";

import { revalidatePath } from "next/cache";

import {
  emailSettingsSchema,
  passwordSettingsSchema,
  profileSettingsSchema,
} from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  removeUserAvatar,
  uploadUserAvatar,
  validateAvatarFile,
} from "@/services/profile/avatar.service";

export type ProfileActionState = {
  ok: boolean;
  message?: string;
};

export async function updateProfileSettingsAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const profile = profileSettingsSchema.safeParse({
    name: String(formData.get("name") ?? ""),
  });
  const email = emailSettingsSchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (!profile.success) return { ok: false, message: profile.error.issues[0]?.message };
  if (!email.success) return { ok: false, message: email.error.issues[0]?.message };

  if (password || confirmation) {
    const parsedPassword = passwordSettingsSchema.safeParse({ password, confirmation });
    if (!parsedPassword.success)
      return { ok: false, message: parsedPassword.error.issues[0]?.message };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase)
    return {
      ok: false,
      message: "Configure as variáveis do Supabase para atualizar o perfil.",
    };

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Sessão expirada. Entre novamente." };

  const authUpdates: { email?: string; password?: string } = {};
  if (email.data.email !== user.email) authUpdates.email = email.data.email;
  if (password) authUpdates.password = password;

  if (Object.keys(authUpdates).length > 0) {
    const { error } = await supabase.auth.updateUser(authUpdates);
    if (error)
      return { ok: false, message: "Não foi possível atualizar os dados de acesso." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ name: profile.data.name })
    .eq("id", user.id);
  if (error)
    return { ok: false, message: "Não foi possível atualizar o perfil agora." };

  revalidatePath("/configuracoes");
  revalidatePath("/dashboard");
  revalidatePath("/projetos");
  revalidatePath("/estatisticas");
  revalidatePath("/calcular-prazo");
  revalidatePath("/registrar-projeto-concluido");

  return {
    ok: true,
    message: authUpdates.email
      ? "Alterações salvas. Confirme o novo e-mail pela mensagem enviada."
      : "Alterações salvas com sucesso.",
  };
}

export async function updateProfileAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = profileSettingsSchema.safeParse({
    name: String(formData.get("name") ?? ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revise os dados informados.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure as variáveis do Supabase para atualizar o perfil.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Sessão expirada. Entre novamente.",
    };
  }

  const avatar = validateAvatarFile(formData.get("avatar"));

  if (avatar.error) {
    return { ok: false, message: avatar.error };
  }

  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  let avatarPath = currentProfile?.avatar_path ?? null;

  if (avatar.file) {
    const uploadedAvatar = await uploadUserAvatar(supabase, user.id, avatar.file);

    if (uploadedAvatar.error || !uploadedAvatar.path) {
      return {
        ok: false,
        message: "Não foi possível enviar a imagem agora.",
      };
    }

    avatarPath = uploadedAvatar.path;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ name: parsed.data.name, avatar_path: avatarPath })
    .eq("id", user.id);

  if (error) {
    if (avatar.file && avatarPath !== currentProfile?.avatar_path) {
      await removeUserAvatar(supabase, avatarPath);
    }

    return {
      ok: false,
      message: "Não foi possível atualizar o perfil agora.",
    };
  }

  revalidatePath("/configuracoes");
  revalidatePath("/dashboard");
  revalidatePath("/projetos");
  revalidatePath("/estatisticas");
  revalidatePath("/calcular-prazo");
  revalidatePath("/registrar-projeto-concluido");

  if (avatar.file && currentProfile?.avatar_path) {
    await removeUserAvatar(supabase, currentProfile.avatar_path);
  }

  return {
    ok: true,
    message: avatar.file
      ? "Perfil e foto atualizados com sucesso."
      : "Perfil atualizado com sucesso.",
  };
}

export async function removeAvatarAction(
  _state: ProfileActionState,
  _formData: FormData,
): Promise<ProfileActionState> {
  void _state;
  void _formData;
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure as variáveis do Supabase para atualizar o perfil.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Sessão expirada. Entre novamente.",
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { ok: false, message: "Não foi possível atualizar a foto agora." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_path: null })
    .eq("id", user.id);

  if (error) {
    return { ok: false, message: "Não foi possível atualizar a foto agora." };
  }

  await removeUserAvatar(supabase, profile?.avatar_path);
  revalidatePath("/configuracoes");
  revalidatePath("/dashboard");
  revalidatePath("/projetos");
  revalidatePath("/estatisticas");
  revalidatePath("/calcular-prazo");
  revalidatePath("/registrar-projeto-concluido");

  return { ok: true, message: "Foto de perfil removida." };
}

export async function updateEmailAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = emailSettingsSchema.safeParse({
    email: String(formData.get("email") ?? ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revise o email informado.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure as variáveis do Supabase para alterar email.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    email: parsed.data.email,
  });

  if (error) {
    return {
      ok: false,
      message: "Não foi possível solicitar alteração de email.",
    };
  }

  revalidatePath("/configuracoes");

  return {
    ok: true,
    message: "Verifique o novo email para confirmar a alteração.",
  };
}

export async function updateAccountPasswordAction(
  _state: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const parsed = passwordSettingsSchema.safeParse({
    password: String(formData.get("password") ?? ""),
    confirmation: String(formData.get("confirmation") ?? ""),
  });

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revise a nova senha.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure as variáveis do Supabase para alterar senha.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return {
      ok: false,
      message: "Não foi possível alterar a senha.",
    };
  }

  return {
    ok: true,
    message: "Senha alterada com sucesso.",
  };
}
