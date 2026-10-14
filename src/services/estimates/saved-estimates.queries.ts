import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapSavedEstimate } from "@/services/estimates/estimate-mappers";

export async function getCurrentUserSavedEstimates() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("projects")
    .select(
      "id,name,total_square_meters,predicted_days,complexity_score,calculation_mode,created_at,updated_at,project_rooms(id,project_id,user_room_id,room_type,room_label,quantity,square_meters,weight_used,complexity_points)",
    )
    .eq("user_id", user.id)
    .is("actual_days", null)
    .order("updated_at", { ascending: false });

  return (data ?? []).map(mapSavedEstimate);
}

export async function getCurrentUserSavedEstimateById(estimateId: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("projects")
    .select(
      "id,name,total_square_meters,predicted_days,complexity_score,calculation_mode,created_at,updated_at,project_rooms(id,project_id,user_room_id,room_type,room_label,quantity,square_meters,weight_used,complexity_points)",
    )
    .eq("id", estimateId)
    .eq("user_id", user.id)
    .is("actual_days", null)
    .maybeSingle();

  return data ? mapSavedEstimate(data) : null;
}
