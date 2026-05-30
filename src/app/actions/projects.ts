"use server";

import { projectEstimateSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProjectEstimate } from "@/types/project";
import { calculateProjectEstimate } from "@/services/prediction";

export type EstimateActionState = {
  ok: boolean;
  estimate?: ProjectEstimate;
  error?: string;
};

export async function estimateProjectAction(
  values: unknown,
): Promise<EstimateActionState> {
  const parsed = projectEstimateSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Revise os dados do projeto.",
    };
  }

  const estimate = calculateProjectEstimate(parsed.data);
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: true,
      estimate,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: true,
      estimate,
    };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: estimate.projectName,
      total_square_meters: estimate.totalSquareMeters,
      predicted_days: estimate.recommendedDays,
      complexity_score: estimate.weightedSquareMeters / estimate.totalSquareMeters,
    })
    .select("id")
    .single();

  if (projectError) {
    return {
      ok: false,
      error: "Nao foi possivel salvar o projeto estimado.",
      estimate,
    };
  }

  const { error: roomsError } = await supabase.from("project_rooms").insert(
    estimate.environments.map((environment) => ({
      project_id: project.id,
      room_type: environment.type,
      quantity: 1,
      square_meters: environment.squareMeters,
      weight_used: environment.weight,
      complexity_points: environment.complexityMultiplier,
    })),
  );

  if (roomsError) {
    return {
      ok: false,
      error: "Projeto salvo, mas houve falha ao salvar os ambientes.",
      estimate,
    };
  }

  return {
    ok: true,
    estimate,
  };
}
