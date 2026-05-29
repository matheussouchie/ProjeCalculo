import type { ComplexityLevel, EnvironmentType } from "@/types/project";

export type CalculatorRoomType = Extract<
  EnvironmentType,
  | "living"
  | "integrated"
  | "kitchen"
  | "living_room"
  | "bedroom"
  | "suite"
  | "bathroom"
  | "social_bathroom"
  | "powder_room"
  | "circulation"
  | "other"
>;

export type CalculatorRoomOption = {
  type: CalculatorRoomType;
  label: string;
  description: string;
  defaultSquareMeters: number;
  complexity: ComplexityLevel;
};

export const calculatorRoomOptions: CalculatorRoomOption[] = [
  {
    type: "living",
    label: "Living",
    description: "Area social principal",
    defaultSquareMeters: 18,
    complexity: "medium",
  },
  {
    type: "integrated",
    label: "Integrado",
    description: "Ambientes conectados",
    defaultSquareMeters: 32,
    complexity: "high",
  },
  {
    type: "kitchen",
    label: "Cozinha",
    description: "Marcenaria e detalhamento tecnico",
    defaultSquareMeters: 12,
    complexity: "high",
  },
  {
    type: "living_room",
    label: "Sala de estar",
    description: "Mobiliario e layout social",
    defaultSquareMeters: 20,
    complexity: "medium",
  },
  {
    type: "bedroom",
    label: "Quarto",
    description: "Ambiente intimo",
    defaultSquareMeters: 12,
    complexity: "medium",
  },
  {
    type: "suite",
    label: "Suite",
    description: "Dormitorio com apoio tecnico",
    defaultSquareMeters: 18,
    complexity: "high",
  },
  {
    type: "bathroom",
    label: "Banheiro",
    description: "Areas molhadas",
    defaultSquareMeters: 5,
    complexity: "high",
  },
  {
    type: "social_bathroom",
    label: "Banheiro social",
    description: "Banheiro de uso comum",
    defaultSquareMeters: 5,
    complexity: "medium",
  },
  {
    type: "powder_room",
    label: "Lavabo",
    description: "Ambiente compacto",
    defaultSquareMeters: 3,
    complexity: "medium",
  },
  {
    type: "circulation",
    label: "Circulacao",
    description: "Corredores e acessos",
    defaultSquareMeters: 8,
    complexity: "low",
  },
  {
    type: "other",
    label: "Outro",
    description: "Ambiente personalizado",
    defaultSquareMeters: 10,
    complexity: "medium",
  },
];
