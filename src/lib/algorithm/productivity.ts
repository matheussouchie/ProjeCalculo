import type { HistoricalProductivitySample } from "@/lib/algorithm/types";

const MIN_PRODUCTIVITY = 1;

function getProductivity(sample: HistoricalProductivitySample) {
  if (sample.totalSquareMeters <= 0 || sample.actualDays <= 0) {
    return null;
  }

  return sample.totalSquareMeters / sample.actualDays;
}

function median(values: number[]) {
  const ordered = [...values].sort((left, right) => left - right);
  const middle = Math.floor(ordered.length / 2);

  if (ordered.length % 2 === 0) {
    return (ordered[middle - 1] + ordered[middle]) / 2;
  }

  return ordered[middle];
}

export function removeExtremeOutliers(values: number[]) {
  if (values.length < 4) {
    return values;
  }

  const center = median(values);
  const lowerLimit = center * 0.35;
  const upperLimit = center * 2.75;

  return values.filter((value) => value >= lowerLimit && value <= upperLimit);
}

export function calculateHistoricalProductivity(
  samples: HistoricalProductivitySample[] | undefined,
  fallbackProductivity: number,
) {
  const productivities = removeExtremeOutliers(
    (samples ?? [])
      .map(getProductivity)
      .filter((value): value is number => value !== null),
  );

  if (productivities.length === 0) {
    return Math.max(fallbackProductivity, MIN_PRODUCTIVITY);
  }

  const total = productivities.reduce((sum, value) => sum + value, 0);

  return Math.max(total / productivities.length, MIN_PRODUCTIVITY);
}

export function resolveProductivity({
  averageProductivity,
  historicalSamples,
  fallbackProductivity,
}: {
  averageProductivity?: number;
  historicalSamples?: HistoricalProductivitySample[];
  fallbackProductivity: number;
}) {
  if (historicalSamples?.length) {
    return calculateHistoricalProductivity(historicalSamples, fallbackProductivity);
  }

  if (averageProductivity && averageProductivity > 0) {
    return averageProductivity;
  }

  return Math.max(fallbackProductivity, MIN_PRODUCTIVITY);
}
