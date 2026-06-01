import { z } from "zod";

const preciseSquareMetersSchema = z.coerce
  .number<number>()
  .positive("A metragem deve ser maior que zero.")
  .max(500, "Revise a metragem informada.")
  .refine((value) => Number.isInteger(value * 10000), {
    message: "Use no máximo 4 casas decimais.",
  });

export const environmentSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  name: z.string().min(2, "Informe um nome para o ambiente."),
  roomLabel: z.string().trim().max(80).optional(),
  complexityWeight: z.coerce.number<number>().min(0.5).max(3).optional(),
  squareMeters: preciseSquareMetersSchema,
  complexity: z.enum(["low", "medium", "high"]),
});

export const projectEstimateSchema = z.object({
  projectName: z.string().trim().max(80, "Use um nome mais curto."),
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

export const emailSettingsSchema = z.object({
  email: z.string().trim().email("Informe um email válido."),
});

export const passwordSettingsSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres."),
    confirmation: z.string().min(6, "Confirme a nova senha."),
  })
  .refine((values) => values.password === values.confirmation, {
    message: "As senhas não conferem.",
    path: ["confirmation"],
  });

export type ProjectEstimateFormValues = z.infer<typeof projectEstimateSchema>;
export type FinishProjectValues = z.infer<typeof finishProjectSchema>;
export type ProfileSettingsValues = z.infer<typeof profileSettingsSchema>;
