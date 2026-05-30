import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUserAnalytics() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      projects: [],
      statistics: null,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      projects: [],
      statistics: null,
    };
  }

  const [projectsResponse, statisticsResponse] = await Promise.all([
    supabase
      .from("projects")
      .select(
        "id,name,total_square_meters,predicted_days,actual_days,complexity_score,created_at,completed_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("user_statistics").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  return {
    projects: projectsResponse.data ?? [],
    statistics: statisticsResponse.data ?? null,
  };
}
