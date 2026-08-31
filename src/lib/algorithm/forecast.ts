import { getRoomWeight } from "@/lib/algorithm/weights";
import {
  calculateAverageErrorMargin,
  calculatePredictionBias,
  resolveProductivity,
} from "@/lib/algorithm/productivity";
import { displayDays, smartRoundDays } from "@/lib/algorithm/rounding";
import type { ForecastInput, ForecastResult } from "@/lib/algorithm/types";

function getConfidence(roomCount: number, historicalSampleCount: number) {
  const base =
    historicalSampleCount === 0
      ? 58
      : historicalSampleCount === 1
        ? 64
        : historicalSampleCount < 5
          ? 72
          : 82;
  const scopeBonus = Math.min(roomCount * 3, 18);

  return Math.min(base + scopeBonus, 94);
}

function clampForecast(days: number) {
  if (!Number.isFinite(days)) {
    return 1;
  }

  return Math.min(Math.max(days, 1), 365);
}

export function forecastProjectDays(input: ForecastInput): ForecastResult {
  const productivityUsed = resolveProductivity({
    averageProductivity: input.averageProductivity,
    historicalSamples: input.historicalSamples,
    fallbackProductivity: input.fallbackProductivity,
  });
  const averageErrorMargin = calculateAverageErrorMargin(input.historicalSamples);
  const predictionBias = calculatePredictionBias(input.historicalSamples);
  const historicalSampleCount = input.historicalSamples?.length ?? 0;
  const calibrationInfluence = Math.min(0.65, historicalSampleCount / 8);
  const calibrationFactor = Math.min(
    1.15,
    Math.max(0.85, 1 + predictionBias * calibrationInfluence),
  );

  const rooms = input.rooms.map((room) => {
    const weight = room.weight ?? getRoomWeight(room.type);
    const weightedSquareMeters = room.squareMeters * weight;

    return {
      ...room,
      weight,
      weightedSquareMeters,
    };
  });

  const totalSquareMeters = rooms.reduce((total, room) => total + room.squareMeters, 0);
  const complexityTotal = rooms.reduce(
    (total, room) => total + room.weightedSquareMeters,
    0,
  );
  const rawPredictedDays = clampForecast(
    (complexityTotal / productivityUsed) * calibrationFactor,
  );
  const predictedDays = smartRoundDays(rawPredictedDays);
  const marginRatio = Math.min(Math.max(averageErrorMargin, 0.12), 0.35);

  return {
    rooms,
    totalSquareMeters,
    complexityTotal,
    productivityUsed,
    averageErrorMargin,
    predictedDays,
    optimisticDays: displayDays(predictedDays * (1 - marginRatio * 0.65)),
    conservativeDays: displayDays(predictedDays * (1 + marginRatio)),
    confidence: getConfidence(rooms.length, historicalSampleCount),
  };
}
