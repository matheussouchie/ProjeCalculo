import type { EnvironmentType } from "@/types/project";

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
};

export const calculatorRoomOptions: CalculatorRoomOption[] = [
  {
    type: "living",
    label: "Living",
    description: "Area social principal",
    defaultSquareMeters: 18,
  },
  {
    type: "integrated",
    label: "Integrado",
    description: "Ambientes conectados",
    defaultSquareMeters: 32,
  },
  {
    type: "kitchen",
    label: "Cozinha",
    description: "Marcenaria e detalhamento tecnico",
    defaultSquareMeters: 12,
  },
  {
    type: "living_room",
    label: "Sala de estar",
    description: "Mobiliario e layout social",
    defaultSquareMeters: 20,
  },
  {
    type: "bedroom",
    label: "Quarto",
    description: "Ambiente intimo",
    defaultSquareMeters: 12,
  },
  {
    type: "suite",
    label: "Suite",
    description: "Dormitorio com apoio tecnico",
    defaultSquareMeters: 18,
  },
  {
    type: "bathroom",
    label: "Banheiro",
    description: "Areas molhadas",
    defaultSquareMeters: 5,
  },
  {
    type: "social_bathroom",
    label: "Banheiro social",
    description: "Banheiro de uso comum",
    defaultSquareMeters: 5,
  },
  {
    type: "powder_room",
    label: "Lavabo",
    description: "Ambiente compacto",
    defaultSquareMeters: 3,
  },
  {
    type: "circulation",
    label: "Circulacao",
    description: "Corredores e acessos",
    defaultSquareMeters: 8,
  },
  {
    type: "other",
    label: "Outro",
    description: "Ambiente personalizado",
    defaultSquareMeters: 10,
  },
];
