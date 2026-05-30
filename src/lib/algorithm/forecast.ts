import { getRoomWeight } from "@/lib/algorithm/weights";
import {
  calculateAverageErrorMargin,
  resolveProductivity,
} from "@/lib/algorithm/productivity";
import { displayDays, smartRoundDays } from "@/lib/algorithm/rounding";
import type { ForecastInput, ForecastResult } from "@/lib/algorithm/types";

function getConfidence(roomCount: number, hasHistoricalSamples: boolean) {
  const base = hasHistoricalSamples ? 72 : 58;
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

  const rooms = input.rooms.map((room) => {
    const weight = getRoomWeight(room.type);
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
  const rawPredictedDays = clampForecast(complexityTotal / productivityUsed);
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
    confidence: getConfidence(rooms.length, Boolean(input.historicalSamples?.length)),
  };
}
