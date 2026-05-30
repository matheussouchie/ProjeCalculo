import type { EnvironmentType } from "@/types/project";

export type AlgorithmRoom = {
  id: string;
  type: EnvironmentType;
  squareMeters: number;
};

export type HistoricalProductivitySample = {
  totalSquareMeters: number;
  actualDays: number;
  predictedDays?: number | null;
  completedAt?: string | null;
};

export type ForecastRoom = AlgorithmRoom & {
  weight: number;
  weightedSquareMeters: number;
};

export type ForecastInput = {
  rooms: AlgorithmRoom[];
  averageProductivity?: number;
  historicalSamples?: HistoricalProductivitySample[];
  fallbackProductivity: number;
};

export type ForecastResult = {
  rooms: ForecastRoom[];
  totalSquareMeters: number;
  complexityTotal: number;
  productivityUsed: number;
  averageErrorMargin: number;
  predictedDays: number;
  optimisticDays: number;
  conservativeDays: number;
  confidence: number;
};
