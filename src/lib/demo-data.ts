import { INITIAL_PRODUCTIVITY_BASE } from "@/constants/initial-history";
import type { HistoricalProject, ProductivityProfile } from "@/types/project";

export const demoProductivity: ProductivityProfile = {
  averageSquareMetersPerDay: Number(
    INITIAL_PRODUCTIVITY_BASE.averageSquareMetersPerDay.toFixed(1),
  ),
  completedProjects: INITIAL_PRODUCTIVITY_BASE.completedProjects,
  historicalAccuracy: INITIAL_PRODUCTIVITY_BASE.historicalAccuracy,
};

export const demoProjects: HistoricalProject[] = [
  {
    id: "proj_001",
    name: "Apartamento Vila Mariana",
    status: "finished",
    totalSquareMeters: 92,
    estimatedDays: 8,
    actualDays: 9,
    finishedAt: "2026-05-08",
  },
  {
    id: "proj_002",
    name: "Studio Pinheiros",
    status: "in_progress",
    totalSquareMeters: 44,
    estimatedDays: 5,
  },
  {
    id: "proj_003",
    name: "Casa Jardim Europa",
    status: "estimating",
    totalSquareMeters: 186,
    estimatedDays: 17,
  },
];
