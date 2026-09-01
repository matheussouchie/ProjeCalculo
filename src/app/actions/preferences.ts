"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const themePreferenceSchema = z.object({
  theme: z.enum(["light", "dark"]),
});

export async function updateThemePreferenceAction(theme: "light" | "dark") {
  const parsed = themePreferenceSchema.safeParse({ theme });

  if (!parsed.success) {
    return {
      ok: false,
      message: "Tema inválido.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure o Supabase para salvar preferências.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Sessão expirada.",
    };
  }

  const { error } = await supabase.from("user_preferences").upsert(
    {
      user_id: user.id,
      theme: parsed.data.theme,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    return {
      ok: false,
      message: "Não foi possível salvar o tema.",
    };
  }

  return {
    ok: true,
    message: "Tema atualizado.",
  };
}
