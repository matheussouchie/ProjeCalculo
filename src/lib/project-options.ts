import type { ComplexityLevel, EnvironmentType } from "@/types/project";

export const environmentLabels: Record<EnvironmentType, string> = {
  integrated: "Integrado",
  circulation: "Circulacao",
  living: "Living",
  bedroom: "Dormitorio",
  suite: "Suite",
  bathroom: "Banheiro",
  social_bathroom: "Banheiro social",
  powder_room: "Lavabo",
  kitchen: "Cozinha",
  living_room: "Sala de estar",
  closet: "Closet",
  laundry: "Lavanderia",
  balcony: "Varanda",
  office: "Escritorio",
  commercial: "Comercial",
  other: "Outro",
};

export const environmentWeights: Record<EnvironmentType, number> = {
  integrated: 1.18,
  circulation: 0.75,
  living: 1.08,
  bedroom: 1,
  suite: 1.18,
  bathroom: 1.35,
  social_bathroom: 1.28,
  powder_room: 1.1,
  kitchen: 1.45,
  living_room: 1.05,
  closet: 1.25,
  laundry: 1.15,
  balcony: 0.9,
  office: 1.05,
  commercial: 1.55,
  other: 1,
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
