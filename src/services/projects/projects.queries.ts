import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

import { mapProjectToCompletedProjectValues } from "@/services/projects/project-mappers";

export async function getCurrentUserProjectForEditing(projectId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("projects")
    .select(
      "id,prediction_id,name,total_square_meters,predicted_days,actual_days,complexity_score,created_at,updated_at,completed_at,project_rooms(id,project_id,user_room_id,room_type,room_label,quantity,square_meters,weight_used,complexity_points)",
    )
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return mapProjectToCompletedProjectValues(data);
}
