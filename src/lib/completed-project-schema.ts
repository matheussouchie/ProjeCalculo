import { z } from "zod";

const squareMetersSchema = z.coerce
  .number<number>()
  .positive()
  .max(500)
  .refine((value) => Number.isInteger(value * 10000), {
    message: "Use no máximo 4 casas decimais.",
  });

const optionalUuidSchema = z.string().uuid().optional().or(z.literal(""));

export const completedProjectRoomSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  roomLabel: z.string().trim().max(80).optional(),
  complexityWeight: z.coerce.number<number>().min(0.5).max(3),
  quantity: z.coerce.number<number>().int().min(1).max(1),
  squareMeters: squareMetersSchema,
});

export const completedProjectSchema = z.object({
  projectId: optionalUuidSchema,
  predictionId: optionalUuidSchema,
  name: z.string().min(2, "Informe o nome do projeto.").max(80),
  actualDays: z.coerce
    .number<number>()
    .int("Use dias corridos inteiros.")
    .min(1, "Informe pelo menos 1 dia.")
    .max(365, "Revise os dias informados."),
  rooms: z.array(completedProjectRoomSchema).min(1, "Adicione ao menos um ambiente."),
});

export type CompletedProjectValues = z.infer<typeof completedProjectSchema>;
