"use server";

import { revalidatePath } from "next/cache";

import { completedProjectSchema } from "@/lib/completed-project-schema";
import { projectEstimateSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPredictionRoomMetrics } from "@/services/prediction/room-metrics";
import type { ProjectEstimate } from "@/types/project";
import { calculateProjectEstimate } from "@/services/prediction";

export type EstimateActionState = {
  ok: boolean;
  estimate?: ProjectEstimate;
  error?: string;
};

export type CompletedProjectActionState = {
  ok: boolean;
  message?: string;
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

export async function registerCompletedProjectAction(
  values: unknown,
): Promise<CompletedProjectActionState> {
  const parsed = completedProjectSchema.safeParse(values);

  if (!parsed.success) {
    return {
      ok: false,
      message:
        parsed.error.issues[0]?.message ?? "Revise os dados do projeto concluido.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure o Supabase para registrar projetos concluidos.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Entre na sua conta para registrar projetos concluidos.",
    };
  }

  const totalSquareMeters = parsed.data.rooms.reduce(
    (total, room) => total + room.squareMeters * room.quantity,
    0,
  );
  const complexityScore = parsed.data.rooms.reduce((total, room) => {
    const metrics = getPredictionRoomMetrics(room.type);

    return total + room.squareMeters * room.quantity * metrics.weight;
  }, 0);
  const predictedDays = Math.max(
    1,
    Math.ceil(
      complexityScore / Math.max(totalSquareMeters / parsed.data.actualDays, 1),
    ),
  );

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      total_square_meters: Number(totalSquareMeters.toFixed(2)),
      predicted_days: predictedDays,
      actual_days: parsed.data.actualDays,
      complexity_score: Number(complexityScore.toFixed(2)),
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (projectError) {
    return {
      ok: false,
      message: "Nao foi possivel registrar o projeto concluido.",
    };
  }

  const { error: roomsError } = await supabase.from("project_rooms").insert(
    parsed.data.rooms.map((room) => {
      const metrics = getPredictionRoomMetrics(room.type);

      return {
        project_id: project.id,
        room_type: room.type,
        quantity: room.quantity,
        square_meters: room.squareMeters,
        weight_used: metrics.weight,
        complexity_points: metrics.complexityPoints,
      };
    }),
  );

  if (roomsError) {
    return {
      ok: false,
      message: "Projeto salvo, mas houve falha ao registrar os ambientes.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/estatisticas");
  revalidatePath("/projetos");
  revalidatePath("/registrar-projeto-concluido");

  return {
    ok: true,
    message: "Projeto concluido registrado. As estatisticas foram atualizadas.",
  };
}
