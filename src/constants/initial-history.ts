import type { ProjectEnvironment } from "@/types/project";

export const INITIAL_HISTORY_PROJECT = {
  name: "Historico inicial ProjeCalculo",
  totalSquareMeters: 91.43,
  actualDays: 11,
  rooms: [
    {
      id: "initial_integrado",
      type: "integrated",
      name: "Integrado",
      squareMeters: 63.18,
      complexity: "medium",
    },
    {
      id: "initial_circulacao",
      type: "circulation",
      name: "Circulacao",
      squareMeters: 15.1,
      complexity: "low",
    },
    {
      id: "initial_bwc_casal",
      type: "bathroom",
      name: "BWC Casal",
      squareMeters: 6.62,
      complexity: "medium",
    },
    {
      id: "initial_bwc_filha",
      type: "bathroom",
      name: "BWC Filha",
      squareMeters: 6.53,
      complexity: "medium",
    },
  ] satisfies ProjectEnvironment[],
};

export const INITIAL_PRODUCTIVITY_BASE = {
  averageSquareMetersPerDay:
    INITIAL_HISTORY_PROJECT.totalSquareMeters / INITIAL_HISTORY_PROJECT.actualDays,
  completedProjects: 1,
  historicalAccuracy: 0.86,
};
