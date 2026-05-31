import { z } from "zod";

const squareMetersSchema = z.coerce
  .number<number>()
  .positive()
  .max(500)
  .refine((value) => Number.isInteger(value * 10000), {
    message: "Use no máximo 4 casas decimais.",
  });

export const completedProjectRoomSchema = z.object({
  id: z.string().min(1),
  type: z.enum([
    "living",
    "integrated",
    "kitchen",
    "living_room",
    "bedroom",
    "suite",
    "bathroom",
    "social_bathroom",
    "powder_room",
    "circulation",
    "other",
  ]),
  roomLabel: z.string().trim().max(80).optional(),
  quantity: z.coerce.number<number>().int().min(1).max(1),
  squareMeters: squareMetersSchema,
});

export const completedProjectSchema = z.object({
  name: z.string().min(2, "Informe o nome do projeto.").max(80),
  actualDays: z.coerce
    .number<number>()
    .int("Use dias corridos inteiros.")
    .min(1, "Informe pelo menos 1 dia.")
    .max(365, "Revise os dias informados."),
  rooms: z.array(completedProjectRoomSchema).min(1, "Adicione ao menos um ambiente."),
});

export type CompletedProjectValues = z.infer<typeof completedProjectSchema>;
