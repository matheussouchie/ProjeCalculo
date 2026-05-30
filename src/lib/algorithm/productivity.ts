import type { HistoricalProductivitySample } from "@/lib/algorithm/types";

const MIN_PRODUCTIVITY = 1;
const RECENT_WEIGHT = 0.7;
const OLDER_WEIGHT = 0.3;
const MAX_PRODUCTIVITY_SHIFT = 0.35;

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
  const validSamples = (samples ?? [])
    .map((sample, index) => ({
      sample,
      index,
      productivity: getProductivity(sample),
    }))
    .filter(
      (
        entry,
      ): entry is {
        sample: HistoricalProductivitySample;
        index: number;
        productivity: number;
      } => entry.productivity !== null,
    )
    .sort((left, right) => {
      const leftDate = left.sample.completedAt
        ? new Date(left.sample.completedAt).getTime()
        : Number.MAX_SAFE_INTEGER - left.index;
      const rightDate = right.sample.completedAt
        ? new Date(right.sample.completedAt).getTime()
        : Number.MAX_SAFE_INTEGER - right.index;

      return rightDate - leftDate;
    });
  const productivities = removeExtremeOutliers(
    validSamples.map((entry) => entry.productivity),
  );

  if (productivities.length === 0) {
    return Math.max(fallbackProductivity, MIN_PRODUCTIVITY);
  }

  const recentLimit = Math.max(1, Math.ceil(productivities.length * 0.35));
  const recent = productivities.slice(0, recentLimit);
  const older = productivities.slice(recentLimit);
  const recentAverage =
    recent.reduce((sum, value) => sum + value, 0) / Math.max(recent.length, 1);
  const olderAverage = older.length
    ? older.reduce((sum, value) => sum + value, 0) / older.length
    : recentAverage;
  const weightedAverage = recentAverage * RECENT_WEIGHT + olderAverage * OLDER_WEIGHT;
  const lowerLimit = fallbackProductivity * (1 - MAX_PRODUCTIVITY_SHIFT);
  const upperLimit = fallbackProductivity * (1 + MAX_PRODUCTIVITY_SHIFT);

  return Math.max(
    Math.min(Math.max(weightedAverage, lowerLimit), upperLimit),
    MIN_PRODUCTIVITY,
  );
}

export function calculateAverageErrorMargin(
  samples: HistoricalProductivitySample[] | undefined,
) {
  const margins = removeExtremeOutliers(
    (samples ?? [])
      .filter(
        (sample) =>
          sample.predictedDays !== null &&
          sample.predictedDays !== undefined &&
          sample.predictedDays > 0 &&
          sample.actualDays > 0,
      )
      .map(
        (sample) =>
          Math.abs(sample.actualDays - sample.predictedDays!) / sample.predictedDays!,
      ),
  );

  if (margins.length === 0) {
    return 0.18;
  }

  return margins.reduce((sum, margin) => sum + margin, 0) / margins.length;
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
