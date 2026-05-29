import {
  complexityMultipliers,
  environmentLabels,
  environmentWeights,
} from "@/lib/project-options";
import type { FinishProjectValues } from "@/lib/schemas";
import type {
  EnvironmentEstimate,
  ProjectEstimate,
  ProjectEstimateInput,
  ProductivityProfile,
} from "@/types/project";
import { roundDays, roundToOneDecimal } from "@/utils/number";

const MINIMUM_PROJECT_DAYS = 2;
const DEFAULT_BUFFER_RATIO = 0.16;

function getExperienceAdjustment(profile: ProductivityProfile) {
  if (profile.completedProjects >= 20) {
    return 0.96;
  }

  if (profile.completedProjects >= 8) {
    return 1;
  }

  return 1.08;
}

function getConfidence(profile: ProductivityProfile, environmentCount: number) {
  const historyScore = Math.min(profile.completedProjects / 20, 1) * 50;
  const accuracyScore = profile.historicalAccuracy * 35;
  const scopeScore = environmentCount <= 8 ? 15 : 10;

  return Math.round(Math.min(historyScore + accuracyScore + scopeScore, 96));
}

function buildInsights(
  environments: EnvironmentEstimate[],
  profile: ProductivityProfile,
): string[] {
  const highestImpact = [...environments].sort(
    (left, right) => right.weightedSquareMeters - left.weightedSquareMeters,
  )[0];

  const insights = [
    `${environmentLabels[highestImpact.type]} concentra o maior impacto no prazo.`,
    `Produtividade base considerada: ${roundToOneDecimal(
      profile.averageSquareMetersPerDay,
    )} m2 por dia.`,
  ];

  if (profile.completedProjects < 5) {
    insights.push("Historico inicial: a margem conservadora fica mais relevante.");
  }

  if (environments.some((environment) => environment.complexity === "high")) {
    insights.push("Ambientes de alta complexidade receberam multiplicador dedicado.");
  }

  return insights;
}

export function calculateProjectEstimate(input: ProjectEstimateInput): ProjectEstimate {
  const environments = input.environments.map((environment) => {
    const weight = environmentWeights[environment.type];
    const complexityMultiplier = complexityMultipliers[environment.complexity];
    const weightedSquareMeters =
      environment.squareMeters * weight * complexityMultiplier;

    return {
      ...environment,
      weight,
      complexityMultiplier,
      weightedSquareMeters: roundToOneDecimal(weightedSquareMeters),
      estimatedDays: roundToOneDecimal(
        weightedSquareMeters / input.productivity.averageSquareMetersPerDay,
      ),
    };
  });

  const totalSquareMeters = environments.reduce(
    (total, environment) => total + environment.squareMeters,
    0,
  );
  const weightedSquareMeters = environments.reduce(
    (total, environment) => total + environment.weightedSquareMeters,
    0,
  );
  const adjustedBaseDays =
    (weightedSquareMeters / input.productivity.averageSquareMetersPerDay) *
    getExperienceAdjustment(input.productivity);
  const bufferedDays = adjustedBaseDays * (1 + DEFAULT_BUFFER_RATIO);
  const confidence = getConfidence(input.productivity, environments.length);
  const realistic = roundDays(bufferedDays, MINIMUM_PROJECT_DAYS);

  return {
    projectName: input.projectName,
    totalSquareMeters: roundToOneDecimal(totalSquareMeters),
    weightedSquareMeters: roundToOneDecimal(weightedSquareMeters),
    baseDays: roundToOneDecimal(adjustedBaseDays),
    confidence,
    recommendedDays: realistic,
    range: {
      optimistic: roundDays(adjustedBaseDays * 0.9, MINIMUM_PROJECT_DAYS),
      realistic,
      conservative: roundDays(bufferedDays * 1.18, MINIMUM_PROJECT_DAYS),
    },
    environments,
    insights: buildInsights(environments, input.productivity),
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
