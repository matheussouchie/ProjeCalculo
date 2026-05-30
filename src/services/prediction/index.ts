import { INITIAL_PRODUCTIVITY_BASE } from "@/constants/initial-history";
import { environmentLabels } from "@/lib/project-options";
import type { FinishProjectValues } from "@/lib/schemas";
import { forecastProjectDays } from "@/lib/algorithm";
import type {
  EnvironmentEstimate,
  ProjectEstimate,
  ProjectEstimateInput,
} from "@/types/project";
import { roundToOneDecimal } from "@/utils/number";

function buildInsights(environments: EnvironmentEstimate[], productivityUsed: number) {
  const highestImpact = [...environments].sort(
    (left, right) => right.weightedSquareMeters - left.weightedSquareMeters,
  )[0];

  if (!highestImpact) {
    return ["Adicione ambientes para gerar uma previsao confiavel."];
  }

  return [
    `${environmentLabels[highestImpact.type]} concentra o maior impacto no prazo.`,
    `Produtividade considerada: ${roundToOneDecimal(productivityUsed)} m2 por dia.`,
    "Outliers historicos extremos sao ignorados antes do calculo de produtividade.",
  ];
}

export function calculateProjectEstimate(input: ProjectEstimateInput): ProjectEstimate {
  const forecast = forecastProjectDays({
    rooms: input.environments.map((environment) => ({
      id: environment.id,
      type: environment.type,
      squareMeters: environment.squareMeters,
    })),
    averageProductivity: input.productivity.averageSquareMetersPerDay,
    fallbackProductivity: INITIAL_PRODUCTIVITY_BASE.averageSquareMetersPerDay,
  });

  const environments: EnvironmentEstimate[] = forecast.rooms.map((room) => {
    const original = input.environments.find(
      (environment) => environment.id === room.id,
    );
    const estimatedDays = room.weightedSquareMeters / forecast.productivityUsed;

    return {
      id: room.id,
      type: room.type,
      name: original?.name ?? environmentLabels[room.type],
      squareMeters: room.squareMeters,
      complexity: original?.complexity ?? "medium",
      complexityMultiplier: 1,
      weight: room.weight,
      weightedSquareMeters: roundToOneDecimal(room.weightedSquareMeters),
      estimatedDays: roundToOneDecimal(estimatedDays),
    };
  });

  return {
    projectName: input.projectName,
    totalSquareMeters: roundToOneDecimal(forecast.totalSquareMeters),
    weightedSquareMeters: roundToOneDecimal(forecast.complexityTotal),
    baseDays: roundToOneDecimal(forecast.complexityTotal / forecast.productivityUsed),
    confidence: forecast.confidence,
    recommendedDays: forecast.predictedDays,
    range: {
      optimistic: forecast.optimisticDays,
      realistic: forecast.predictedDays,
      conservative: forecast.conservativeDays,
    },
    environments,
    insights: buildInsights(environments, forecast.productivityUsed),
  };
}

export function updateProductivityAfterProject(values: FinishProjectValues) {
  const realizedProductivity = values.totalSquareMeters / values.actualDays;
  const totalProjects = values.completedProjects + 1;
  const previousWeight = values.completedProjects / totalProjects;
  const newWeight = 1 / totalProjects;
  const averageSquareMetersPerDay =
    values.currentAverageSquareMetersPerDay * previousWeight +
    realizedProductivity * newWeight;
  const errorRatio =
    Math.abs(values.actualDays - values.estimatedDays) / values.estimatedDays;

  return {
    averageSquareMetersPerDay: roundToOneDecimal(averageSquareMetersPerDay),
    completedProjects: totalProjects,
    historicalAccuracy: Math.max(0.1, roundToOneDecimal(1 - errorRatio)),
  };
}
