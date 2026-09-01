import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const themePreferenceSchema = z.object({
  theme: z.enum(["light", "dark"]),
});

export async function PUT(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = themePreferenceSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ message: "Tema inválido." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return Response.json(
      { message: "Configure o Supabase para salvar preferências." },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ message: "Sessão expirada." }, { status: 401 });
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
    return Response.json(
      { message: "Não foi possível salvar o tema." },
      { status: 500 },
    );
  }

  return Response.json({ ok: true });
}
