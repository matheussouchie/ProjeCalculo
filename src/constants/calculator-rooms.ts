export type CalculatorRoomType = string;

export type CalculatorRoomOption = {
  type: CalculatorRoomType;
  label: string;
  description: string;
  defaultSquareMeters: number;
  complexityWeight: number;
  color?: string | null;
  systemKey?: string | null;
};

export const calculatorRoomOptions: CalculatorRoomOption[] = [
  {
    type: "living",
    label: "Living",
    description: "Area social principal",
    defaultSquareMeters: 18,
    complexityWeight: 1.4,
    systemKey: "living",
  },
  {
    type: "integrated",
    label: "Integrado",
    description: "Ambientes conectados",
    defaultSquareMeters: 32,
    complexityWeight: 1.3,
    systemKey: "integrated",
  },
  {
    type: "kitchen",
    label: "Cozinha",
    description: "Marcenaria e detalhamento tecnico",
    defaultSquareMeters: 12,
    complexityWeight: 1.5,
    systemKey: "kitchen",
  },
  {
    type: "living_room",
    label: "Sala de estar",
    description: "Mobiliario e layout social",
    defaultSquareMeters: 20,
    complexityWeight: 1.2,
    systemKey: "living_room",
  },
  {
    type: "bedroom",
    label: "Quarto",
    description: "Ambiente intimo",
    defaultSquareMeters: 12,
    complexityWeight: 1.1,
    systemKey: "bedroom",
  },
  {
    type: "suite",
    label: "Suite",
    description: "Dormitorio com apoio tecnico",
    defaultSquareMeters: 18,
    complexityWeight: 1.4,
    systemKey: "suite",
  },
  {
    type: "bathroom",
    label: "Banheiro",
    description: "Areas molhadas",
    defaultSquareMeters: 5,
    complexityWeight: 1.6,
    systemKey: "bathroom",
  },
  {
    type: "social_bathroom",
    label: "Banheiro social",
    description: "Banheiro de uso comum",
    defaultSquareMeters: 5,
    complexityWeight: 1.45,
    systemKey: "social_bathroom",
  },
  {
    type: "powder_room",
    label: "Lavabo",
    description: "Ambiente compacto",
    defaultSquareMeters: 3,
    complexityWeight: 1.2,
    systemKey: "powder_room",
  },
  {
    type: "circulation",
    label: "Circulacao",
    description: "Corredores e acessos",
    defaultSquareMeters: 8,
    complexityWeight: 0.6,
    systemKey: "circulation",
  },
  {
    type: "other",
    label: "Outro",
    description: "Ambiente personalizado",
    defaultSquareMeters: 10,
    complexityWeight: 1,
    systemKey: "other",
  },
];
