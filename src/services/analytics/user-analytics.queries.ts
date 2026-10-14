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
        "id,prediction_id,name,total_square_meters,predicted_days,actual_days,complexity_score,created_at,updated_at,completed_at",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
    supabase.from("user_statistics").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  const projects = projectsResponse.data ?? [];
  const completedEstimateIds = new Set(
    projects
      .filter((project) => project.actual_days !== null && project.prediction_id)
      .map((project) => project.prediction_id),
  );

  return {
    // A completed project supersedes only its real linked estimate. Names and dates
    // are deliberately not used here because they are not a stable relationship.
    projects: projects.filter(
      (project) => project.actual_days !== null || !completedEstimateIds.has(project.id),
    ),
    statistics: statisticsResponse.data ?? null,
  };
}
