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

export const complexityLabels: Record<ComplexityLevel, string> = {
  low: "Baixa",
  medium: "Media",
  high: "Alta",
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
