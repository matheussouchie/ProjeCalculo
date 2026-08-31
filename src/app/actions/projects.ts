"use server";

import { revalidatePath } from "next/cache";

import {
  deadlineCalculatorSchema,
  type DeadlineCalculatorValues,
} from "@/lib/calculator-schema";
import { notificationMessages } from "@/constants/notifications";
import { completedProjectSchema } from "@/lib/completed-project-schema";
import { projectEstimateSchema } from "@/lib/schemas";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getUniqueProjectName } from "@/services/project-naming.service";
import { getPredictionRoomMetrics } from "@/services/prediction/room-metrics";
import { resolveRoomLabel } from "@/services/rooms/room-labels";
import { mapStatisticsToProductivityProfile } from "@/services/user-statistics.service";
import type { ProjectEstimate } from "@/types/project";
import { calculateProjectEstimate } from "@/services/prediction";
import type { Database } from "@/types/database";

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

export type ProjectActionState = {
  ok: boolean;
  message?: string;
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

async function getUserRoomsById(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  userId: string,
) {
  const { data } = await supabase
    .from("user_rooms")
    .select("id,name,system_key,complexity_weight")
    .eq("user_id", userId);

  return new Map((data ?? []).map((room) => [room.id, room]));
}

async function getCompletedProjectById(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  userId: string,
  projectId: string,
) {
  const { data } = await supabase
    .from("projects")
    .select(
      "id,prediction_id,name,total_square_meters,predicted_days,actual_days,complexity_score,created_at,updated_at,completed_at,project_rooms(id,project_id,user_room_id,room_type,room_label,quantity,square_meters,weight_used,complexity_points)",
    )
    .eq("id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  return data;
}

async function getPredictionProjectPredictedDays(
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>,
  userId: string,
  predictionId: string,
) {
  const { data } = await supabase
    .from("projects")
    .select("predicted_days")
    .eq("id", predictionId)
    .eq("user_id", userId)
    .is("actual_days", null)
    .maybeSingle();

  return data?.predicted_days ?? null;
}

function resolveServerRoomLabel(
  room: DeadlineCalculatorValues["rooms"][number],
  rooms: DeadlineCalculatorValues["rooms"],
  userRoomsById: Map<
    string,
    Pick<Database["public"]["Tables"]["user_rooms"]["Row"], "name">
  >,
) {
  const customLabel = room.roomLabel?.trim();

  if (customLabel) {
    return customLabel;
  }

  const baseName = userRoomsById.get(room.type)?.name ?? "Ambiente";
  const sequence = String(
    rooms
      .filter((item) => item.type === room.type)
      .findIndex((item) => item.id === room.id) + 1,
  ).padStart(2, "0");

  return `${baseName} ${sequence}`;
}

function buildEstimateInput(
  values: DeadlineCalculatorValues,
  projectName: string,
  userRoomsById: Map<
    string,
    Pick<Database["public"]["Tables"]["user_rooms"]["Row"], "name">
  >,
) {
  const rooms = values.rooms.map((room) => ({
    ...room,
    roomLabel: resolveServerRoomLabel(room, values.rooms, userRoomsById),
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
        complexityWeight: room.complexityWeight,
        squareMeters: Number(room.squareMeters),
        complexity: "medium" as const,
      })),
  };
}

function getRoomPersistenceData(
  room: {
    type: string;
    complexityWeight?: number;
  },
  userRoomsById: Map<
    string,
    Pick<
      Database["public"]["Tables"]["user_rooms"]["Row"],
      "id" | "name" | "system_key" | "complexity_weight"
    >
  >,
) {
  const userRoom = userRoomsById.get(room.type);
  const weight = userRoom?.complexity_weight ?? room.complexityWeight ?? 1;

  return {
    userRoomId: userRoom?.id ?? null,
    roomType: userRoom?.system_key ?? userRoom?.name ?? room.type,
    weight,
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
      error: notificationMessages.saveError,
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
      error: notificationMessages.saveError,
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

  const projectId = parsed.data.projectId || undefined;
  const predictionId = parsed.data.predictionId || undefined;
  const totalSquareMeters = parsed.data.rooms.reduce(
    (total, room) => total + room.squareMeters,
    0,
  );
  const complexityScore = parsed.data.rooms.reduce((total, room) => {
    const metrics = getPredictionRoomMetrics(room.type, room.complexityWeight);

    return total + room.squareMeters * metrics.weight;
  }, 0);
  const userRoomsById = await getUserRoomsById(supabase, user.id);
  const statisticsResponse = await supabase
    .from("user_statistics")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  const existingProject = projectId
    ? await getCompletedProjectById(supabase, user.id, projectId)
    : null;
  const linkedPredictionDays = predictionId
    ? await getPredictionProjectPredictedDays(supabase, user.id, predictionId)
    : null;
  const fallbackPredictedDays = calculateProjectEstimate({
    projectName: parsed.data.name,
    environments: parsed.data.rooms.map((room) => ({
      id: room.id,
      type: room.type,
      name: resolveServerRoomLabel(room, parsed.data.rooms, userRoomsById),
      roomLabel: resolveServerRoomLabel(room, parsed.data.rooms, userRoomsById),
      complexityWeight: room.complexityWeight,
      squareMeters: room.squareMeters,
      complexity: "medium" as const,
    })),
    productivity: mapStatisticsToProductivityProfile(statisticsResponse.data),
    historicalSamples: await getHistoricalSamples(supabase, user.id),
  }).recommendedDays;
  const predictedDays =
    linkedPredictionDays ?? existingProject?.predicted_days ?? fallbackPredictedDays;

  if (projectId) {
    if (!existingProject) {
      return {
        ok: false,
        message: "Projeto não encontrado.",
      };
    }

    const { error: updateError } = await supabase
      .from("projects")
      .update({
        prediction_id: predictionId ?? null,
        name: parsed.data.name,
        total_square_meters: Number(totalSquareMeters.toFixed(4)),
        predicted_days: predictedDays,
        actual_days: parsed.data.actualDays,
        complexity_score: Number(complexityScore.toFixed(4)),
        completed_at: existingProject.completed_at,
      })
      .eq("id", projectId)
      .eq("user_id", user.id);

    if (updateError) {
      return {
        ok: false,
        message: notificationMessages.saveError,
      };
    }

    const { error: deleteRoomsError } = await supabase
      .from("project_rooms")
      .delete()
      .eq("project_id", projectId);

    if (deleteRoomsError) {
      return {
        ok: false,
        message: notificationMessages.saveError,
      };
    }

    const { error: insertRoomsError } = await supabase.from("project_rooms").insert(
      parsed.data.rooms.map((room) => {
        const persistence = getRoomPersistenceData(room, userRoomsById);
        const metrics = getPredictionRoomMetrics(room.type, persistence.weight);

        return {
          project_id: projectId,
          user_room_id: persistence.userRoomId,
          room_type: persistence.roomType,
          room_label: resolveRoomLabel(room, parsed.data.rooms),
          quantity: 1,
          square_meters: room.squareMeters,
          weight_used: metrics.weight,
          complexity_points: metrics.complexityPoints,
        };
      }),
    );

    if (insertRoomsError) {
      return {
        ok: false,
        message: notificationMessages.saveError,
      };
    }

    revalidatePath("/dashboard");
    revalidatePath("/estatisticas");
    revalidatePath("/projetos");
    revalidatePath("/registrar-projeto-concluido");

    return {
      ok: true,
      message: predictionId
        ? notificationMessages.predictionLinked
        : notificationMessages.updated,
    };
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      prediction_id: predictionId ?? null,
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
      message: notificationMessages.saveError,
    };
  }

  const { error: roomsError } = await supabase.from("project_rooms").insert(
    parsed.data.rooms.map((room) => {
      const persistence = getRoomPersistenceData(room, userRoomsById);
      const metrics = getPredictionRoomMetrics(room.type, persistence.weight);

      return {
        project_id: project.id,
        user_room_id: persistence.userRoomId,
        room_type: persistence.roomType,
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
      message: notificationMessages.saveError,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/estatisticas");
  revalidatePath("/projetos");
  revalidatePath("/registrar-projeto-concluido");

  return {
    ok: true,
    message: predictionId
      ? notificationMessages.predictionLinked
      : notificationMessages.saved,
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
  const userRoomsById = await getUserRoomsById(supabase, user.id);
  const estimateInput = buildEstimateInput(parsed.data, projectName, userRoomsById);

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
      message: notificationMessages.saveError,
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
        message: notificationMessages.saveError,
      };
    }
  }

  const { error: roomsError } = await supabase.from("project_rooms").insert(
    estimate.environments.map((environment) => {
      const persistence = getRoomPersistenceData(environment, userRoomsById);

      return {
        project_id: projectResponse.data.id,
        user_room_id: persistence.userRoomId,
        room_type: persistence.roomType,
        room_label: environment.name,
        quantity: 1,
        square_meters: environment.squareMeters,
        weight_used: persistence.weight,
        complexity_points: environment.complexityMultiplier,
      };
    }),
  );

  if (roomsError) {
    return {
      ok: false,
      message: notificationMessages.saveError,
    };
  }

  revalidatePath("/calcular-prazo");
  revalidatePath("/dashboard");
  revalidatePath("/projetos");

  return {
    ok: true,
    estimateId: projectResponse.data.id,
    message: parsed.data.projectId
      ? notificationMessages.updated
      : notificationMessages.saved,
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
      message: notificationMessages.saveError,
    };
  }

  revalidatePath("/calcular-prazo");
  revalidatePath("/dashboard");
  revalidatePath("/projetos");

  return {
    ok: true,
    message: notificationMessages.deleted,
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
      "name,total_square_meters,predicted_days,complexity_score,project_rooms(user_room_id,room_type,room_label,quantity,square_meters,weight_used,complexity_points)",
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
      message: notificationMessages.saveError,
    };
  }

  const { error: roomsError } = await supabase.from("project_rooms").insert(
    project.project_rooms.map((room) => ({
      project_id: duplicatedProject.id,
      user_room_id: room.user_room_id,
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
      message: notificationMessages.saveError,
    };
  }

  revalidatePath("/calcular-prazo");
  revalidatePath("/dashboard");
  revalidatePath("/projetos");

  return {
    ok: true,
    estimateId: duplicatedProject.id,
    message: notificationMessages.saved,
  };
}

export async function deleteProjectAction(
  projectId: string,
): Promise<ProjectActionState> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure o Supabase para excluir projetos.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Entre na sua conta para excluir projetos.",
    };
  }

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", user.id);

  if (error) {
    return {
      ok: false,
      message: notificationMessages.saveError,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/estatisticas");
  revalidatePath("/projetos");

  return {
    ok: true,
    message: notificationMessages.deleted,
  };
}

export async function duplicateProjectAction(
  projectId: string,
): Promise<ProjectActionState> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure o Supabase para duplicar projetos.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Entre na sua conta para duplicar projetos.",
    };
  }

  const project = await getCompletedProjectById(supabase, user.id, projectId);

  if (!project) {
    return {
      ok: false,
      message: "Projeto não encontrado.",
    };
  }

  const { data: duplicatedProject, error: duplicateProjectError } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      prediction_id: project.prediction_id,
      name: `Cópia de ${project.name}`,
      total_square_meters: project.total_square_meters,
      predicted_days: project.predicted_days,
      actual_days: project.actual_days,
      complexity_score: project.complexity_score,
      completed_at: new Date().toISOString(),
    })
    .select("id")
    .single();

  if (duplicateProjectError) {
    return {
      ok: false,
      message: notificationMessages.saveError,
    };
  }

  const { error: roomsError } = await supabase.from("project_rooms").insert(
    project.project_rooms.map((room) => ({
      project_id: duplicatedProject.id,
      user_room_id: room.user_room_id,
      room_type: room.room_type,
      room_label: room.room_label,
      quantity: room.quantity,
      square_meters: room.square_meters,
      weight_used: room.weight_used,
      complexity_points: room.complexity_points,
    })),
  );

  if (roomsError) {
    return {
      ok: false,
      message: notificationMessages.saveError,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/estatisticas");
  revalidatePath("/projetos");
  revalidatePath("/registrar-projeto-concluido");

  return {
    ok: true,
    message: notificationMessages.duplicated,
  };
}
