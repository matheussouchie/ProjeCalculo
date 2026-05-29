import type { ComplexityLevel, EnvironmentType } from "@/types/project";

export const environmentLabels: Record<EnvironmentType, string> = {
  integrated: "Integrado",
  circulation: "Circulacao",
  bedroom: "Dormitorio",
  bathroom: "Banheiro",
  kitchen: "Cozinha",
  living_room: "Sala",
  closet: "Closet",
  laundry: "Lavanderia",
  balcony: "Varanda",
  office: "Escritorio",
  commercial: "Comercial",
};

export const environmentWeights: Record<EnvironmentType, number> = {
  integrated: 1.18,
  circulation: 0.75,
  bedroom: 1,
  bathroom: 1.35,
  kitchen: 1.45,
  living_room: 1.05,
  closet: 1.25,
  laundry: 1.15,
  balcony: 0.9,
  office: 1.05,
  commercial: 1.55,
};

export const complexityLabels: Record<ComplexityLevel, string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
};

export const complexityMultipliers: Record<ComplexityLevel, number> = {
  low: 0.9,
  medium: 1,
  high: 1.25,
};

export const environmentOptions = Object.entries(environmentLabels).map(
  ([value, label]) => ({
    value: value as EnvironmentType,
    label,
  }),
);

export const complexityOptions = Object.entries(complexityLabels).map(
  ([value, label]) => ({
    value: value as ComplexityLevel,
    label,
  }),
);
