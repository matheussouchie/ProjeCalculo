"use server";

import { revalidatePath } from "next/cache";

import {
  deadlineCalculatorSchema,
  type DeadlineCalculatorValues,
} from "@/lib/calculator-schema";
import { completedProjectSchema } from "@/lib/completed-project-schema";
import { projectEstimateSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUniqueProjectName } from "@/services/project-naming.service";
import { getPredictionRoomMetrics } from "@/services/prediction/room-metrics";
import { resolveRoomLabel } from "@/services/rooms/room-labels";
import { mapStatisticsToProductivityProfile } from "@/services/user-statistics.service";
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

export type SavedEstimateActionState = {
  ok: boolean;
  message?: string;
  estimateId?: string;
};

async function getHistoricalSamples(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  userId: string,
) {
  const { data: historicalProjects } = await supabase
    .from("projects")
    .select("total_square_meters,actual_days,predicted_days,completed_at")
    .eq("user_id", userId)
    .not("actual_days", "is", null)
    .order("completed_at", { ascending: false })
    .limit(40);

  return (historicalProjects ?? [])
    .filter((project) => project.actual_days !== null)
    .map((project) => ({
      totalSquareMeters: project.total_square_meters,
      actualDays: project.actual_days ?? 0,
      predictedDays: project.predicted_days,
      completedAt: project.completed_at,
    }));
}

async function getExistingProjectNames(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  userId: string,
  ignoredProjectId?: string,
) {
  const { data } = await supabase
    .from("projects")
    .select("id,name")
    .eq("user_id", userId)
    .is("actual_days", null);

  return (data ?? [])
    .filter((project) => project.id !== ignoredProjectId)
    .map((project) => project.name);
}

function buildEstimateInput(values: DeadlineCalculatorValues, projectName: string) {
  const rooms = values.rooms.map((room) => ({
    ...room,
    roomLabel: resolveRoomLabel(room, values.rooms),
  }));

  return {
    projectName,
    rooms,
    environments: rooms
      .filter((room) => Number(room.squareMeters) > 0)
      .map((room) => ({
        id: room.id,
        type: room.type,
        name: room.roomLabel,
        roomLabel: room.roomLabel,
        squareMeters: Number(room.squareMeters),
        complexity: "medium" as const,
      })),
  };
}

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

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    const estimate = calculateProjectEstimate(parsed.data);

    return {
      ok: true,
      estimate,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const estimate = calculateProjectEstimate(parsed.data);

    return {
      ok: true,
      estimate,
    };
  }

  const { data: historicalProjects } = await supabase
    .from("projects")
    .select("total_square_meters,actual_days,predicted_days,completed_at")
    .eq("user_id", user.id)
    .not("actual_days", "is", null)
    .order("completed_at", { ascending: false })
    .limit(40);
  const estimate = calculateProjectEstimate({
    ...parsed.data,
    historicalSamples: (historicalProjects ?? [])
      .filter((project) => project.actual_days !== null)
      .map((project) => ({
        totalSquareMeters: project.total_square_meters,
        actualDays: project.actual_days ?? 0,
        predictedDays: project.predicted_days,
        completedAt: project.completed_at,
      })),
  });

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
      room_label: environment.name,
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
    (total, room) => total + room.squareMeters,
    0,
  );
  const complexityScore = parsed.data.rooms.reduce((total, room) => {
    const metrics = getPredictionRoomMetrics(room.type);

    return total + room.squareMeters * metrics.weight;
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
      total_square_meters: Number(totalSquareMeters.toFixed(4)),
      predicted_days: predictedDays,
      actual_days: parsed.data.actualDays,
      complexity_score: Number(complexityScore.toFixed(4)),
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
        room_label: resolveRoomLabel(room, parsed.data.rooms),
        quantity: 1,
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

export async function saveEstimateAction(
  values: unknown,
): Promise<SavedEstimateActionState> {
  const parsed = deadlineCalculatorSchema.safeParse(values);

  if (!parsed.success || parsed.data.rooms.length === 0) {
    return {
      ok: false,
      message: parsed.error?.issues[0]?.message ?? "Adicione ambientes para salvar.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure o Supabase para salvar estimativas.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Entre na sua conta para salvar estimativas.",
    };
  }

  const existingNames = await getExistingProjectNames(
    supabase,
    user.id,
    parsed.data.projectId,
  );
  const projectName = getUniqueProjectName(parsed.data.projectName, existingNames);
  const estimateInput = buildEstimateInput(parsed.data, projectName);

  if (estimateInput.environments.length === 0) {
    return {
      ok: false,
      message: "Informe a metragem de ao menos um ambiente.",
    };
  }

  const statisticsResponse = await supabase
    .from("user_statistics")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  const estimate = calculateProjectEstimate({
    projectName,
    environments: estimateInput.environments,
    productivity: mapStatisticsToProductivityProfile(statisticsResponse.data),
    historicalSamples: await getHistoricalSamples(supabase, user.id),
  });

  const projectPayload = {
    name: projectName,
    total_square_meters: estimate.totalSquareMeters,
    predicted_days: estimate.recommendedDays,
    complexity_score: estimate.weightedSquareMeters,
  };

  const projectResponse = parsed.data.projectId
    ? await supabase
        .from("projects")
        .update(projectPayload)
        .eq("id", parsed.data.projectId)
        .eq("user_id", user.id)
        .is("actual_days", null)
        .select("id")
        .single()
    : await supabase
        .from("projects")
        .insert({
          ...projectPayload,
          user_id: user.id,
        })
        .select("id")
        .single();

  if (projectResponse.error) {
    return {
      ok: false,
      message: "Não foi possível salvar esta estimativa.",
    };
  }

  if (parsed.data.projectId) {
    const { error: deleteRoomsError } = await supabase
      .from("project_rooms")
      .delete()
      .eq("project_id", parsed.data.projectId);

    if (deleteRoomsError) {
      return {
        ok: false,
        message: "Estimativa atualizada, mas houve falha ao renovar ambientes.",
      };
    }
  }

  const { error: roomsError } = await supabase.from("project_rooms").insert(
    estimate.environments.map((environment) => ({
      project_id: projectResponse.data.id,
      room_type: environment.type,
      room_label: environment.name,
      quantity: 1,
      square_meters: environment.squareMeters,
      weight_used: environment.weight,
      complexity_points: environment.complexityMultiplier,
    })),
  );

  if (roomsError) {
    return {
      ok: false,
      message: "Estimativa salva, mas houve falha ao salvar os ambientes.",
    };
  }

  revalidatePath("/calcular-prazo");
  revalidatePath("/dashboard");
  revalidatePath("/projetos");

  return {
    ok: true,
    estimateId: projectResponse.data.id,
    message: parsed.data.projectId
      ? "Estimativa atualizada com sucesso."
      : "Estimativa salva com sucesso.",
  };
}

export async function deleteEstimateAction(
  projectId: string,
): Promise<SavedEstimateActionState> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure o Supabase para excluir estimativas.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Entre na sua conta para excluir estimativas.",
    };
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("actual_days", null);

  if (error) {
    return {
      ok: false,
      message: "Não foi possível excluir esta estimativa.",
    };
  }

  revalidatePath("/calcular-prazo");
  revalidatePath("/dashboard");
  revalidatePath("/projetos");

  return {
    ok: true,
    message: "Estimativa excluída.",
  };
}

export async function duplicateEstimateAction(
  projectId: string,
): Promise<SavedEstimateActionState> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure o Supabase para duplicar estimativas.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Entre na sua conta para duplicar estimativas.",
    };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(
      "name,total_square_meters,predicted_days,complexity_score,project_rooms(room_type,room_label,quantity,square_meters,weight_used,complexity_points)",
    )
    .eq("id", projectId)
    .eq("user_id", user.id)
    .is("actual_days", null)
    .single();

  if (projectError || !project) {
    return {
      ok: false,
      message: "Estimativa não encontrada.",
    };
  }

  const existingNames = await getExistingProjectNames(supabase, user.id);
  const copyName = getUniqueProjectName(`${project.name} Cópia`, existingNames);
  const { data: duplicatedProject, error: duplicateProjectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      name: copyName,
      total_square_meters: project.total_square_meters,
      predicted_days: project.predicted_days,
      complexity_score: project.complexity_score,
    })
    .select("id")
    .single();

  if (duplicateProjectError) {
    return {
      ok: false,
      message: "Não foi possível duplicar esta estimativa.",
    };
  }

  const { error: roomsError } = await supabase.from("project_rooms").insert(
    project.project_rooms.map((room) => ({
      project_id: duplicatedProject.id,
      room_type: room.room_type,
      room_label: room.room_label,
      quantity: 1,
      square_meters: room.square_meters,
      weight_used: room.weight_used,
      complexity_points: room.complexity_points,
    })),
  );

  if (roomsError) {
    return {
      ok: false,
      message: "Estimativa duplicada, mas houve falha nos ambientes.",
    };
  }

  revalidatePath("/calcular-prazo");
  revalidatePath("/dashboard");
  revalidatePath("/projetos");

  return {
    ok: true,
    estimateId: duplicatedProject.id,
    message: "Estimativa duplicada.",
  };
}
