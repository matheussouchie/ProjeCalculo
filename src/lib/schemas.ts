import { z } from "zod";

export const environmentSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "integrated",
    "circulation",
    "living",
    "bedroom",
    "suite",
    "bathroom",
    "social_bathroom",
    "powder_room",
    "kitchen",
    "living_room",
    "closet",
    "laundry",
    "balcony",
    "office",
    "commercial",
    "other",
  ]),
  name: z.string().min(2, "Informe um nome para o ambiente."),
  squareMeters: z.coerce
    .number<number>()
    .positive("A metragem deve ser maior que zero.")
    .max(500, "Revise a metragem informada."),
  complexity: z.enum(["low", "medium", "high"]),
});

export const projectEstimateSchema = z.object({
  projectName: z
    .string()
    .min(2, "Informe o nome do projeto.")
    .max(80, "Use um nome mais curto."),
  environments: z
    .array(environmentSchema)
    .min(1, "Adicione ao menos um ambiente.")
    .max(24, "Divida projetos muito grandes em etapas."),
  productivity: z.object({
    averageSquareMetersPerDay: z.coerce
      .number<number>()
      .positive("A produtividade deve ser maior que zero.")
      .max(80, "Revise a produtividade diaria."),
    completedProjects: z.coerce.number<number>().int().min(0).max(1000),
    historicalAccuracy: z.coerce.number<number>().min(0.1).max(1),
  }),
});

export const finishProjectSchema = z.object({
  estimatedDays: z.coerce.number<number>().positive(),
  actualDays: z.coerce.number<number>().positive(),
  currentAverageSquareMetersPerDay: z.coerce.number<number>().positive(),
  totalSquareMeters: z.coerce.number<number>().positive(),
  completedProjects: z.coerce.number<number>().int().min(0),
});

export const profileSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres.")
    .max(80, "Use um nome mais curto."),
});

export type ProjectEstimateFormValues = z.infer<typeof projectEstimateSchema>;
export type FinishProjectValues = z.infer<typeof finishProjectSchema>;
export type ProfileSettingsValues = z.infer<typeof profileSettingsSchema>;
