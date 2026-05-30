import { getRoomWeight } from "@/lib/algorithm/weights";
import { resolveProductivity } from "@/lib/algorithm/productivity";
import { displayDays, smartRoundDays } from "@/lib/algorithm/rounding";
import type { ForecastInput, ForecastResult } from "@/lib/algorithm/types";

function getConfidence(roomCount: number, hasHistoricalSamples: boolean) {
  const base = hasHistoricalSamples ? 72 : 58;
  const scopeBonus = Math.min(roomCount * 3, 18);

  return Math.min(base + scopeBonus, 94);
}

export function forecastProjectDays(input: ForecastInput): ForecastResult {
  const productivityUsed = resolveProductivity({
    averageProductivity: input.averageProductivity,
    historicalSamples: input.historicalSamples,
    fallbackProductivity: input.fallbackProductivity,
  });

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
  const predictedDays = smartRoundDays(complexityTotal / productivityUsed);

  return {
    rooms,
    totalSquareMeters,
    complexityTotal,
    productivityUsed,
    predictedDays,
    optimisticDays: displayDays(predictedDays * 0.9),
    conservativeDays: displayDays(predictedDays * 1.18),
    confidence: getConfidence(rooms.length, Boolean(input.historicalSamples?.length)),
  };
}
