import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type ThemePreference = "light" | "dark";

export async function getCurrentUserThemePreference(): Promise<ThemePreference> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return "light";
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return "light";
  }

  const { data } = await supabase
    .from("user_preferences")
    .select("theme")
    .eq("user_id", user.id)
    .maybeSingle();

  return data?.theme ?? "light";
}
