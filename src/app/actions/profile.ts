"use server";

import { revalidatePath } from "next/cache";

import { profileSettingsSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ProfileActionState = {
  ok: boolean;
  message?: string;
};

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

  const { error } = await supabase
    .from("profiles")
    .update({ name: parsed.data.name })
    .eq("id", user.id);

  if (error) {
    return {
      ok: false,
      message: "Não foi possível atualizar o perfil agora.",
    };
  }

  revalidatePath("/configuracoes");
  revalidatePath("/dashboard");

  return {
    ok: true,
    message: "Perfil atualizado com sucesso.",
  };
}
