export type ComplexityLevel = "low" | "medium" | "high";

export type EnvironmentType = string;

export type ProjectStatus = "estimating" | "in_progress" | "finished";

export type ProjectEnvironment = {
  id: string;
  type: EnvironmentType;
  name: string;
  roomLabel?: string;
  complexityWeight?: number;
  squareMeters: number;
  complexity: ComplexityLevel;
};

export type ProductivityProfile = {
  averageSquareMetersPerDay: number;
  completedProjects: number;
  historicalAccuracy: number;
};

export type ProjectEstimateInput = {
  projectName: string;
  environments: ProjectEnvironment[];
  productivity: ProductivityProfile;
  historicalSamples?: {
    totalSquareMeters: number;
    actualDays: number;
    predictedDays?: number | null;
    completedAt?: string | null;
  }[];
};

export type EnvironmentEstimate = ProjectEnvironment & {
  weight: number;
  complexityMultiplier: number;
  weightedSquareMeters: number;
  estimatedDays: number;
};

export type ProjectEstimate = {
  projectName: string;
  totalSquareMeters: number;
  weightedSquareMeters: number;
  baseDays: number;
  confidence: number;
  recommendedDays: number;
  range: {
    optimistic: number;
    realistic: number;
    conservative: number;
  };
  environments: EnvironmentEstimate[];
  insights: string[];
};

export type HistoricalProject = {
  id: string;
  name: string;
  status: ProjectStatus;
  totalSquareMeters: number;
  estimatedDays: number;
  actualDays?: number;
  finishedAt?: string;
};
