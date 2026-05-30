import { z } from "zod";

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
  quantity: z.coerce.number<number>().int().min(1).max(20),
  squareMeters: z.coerce.number<number>().positive().max(500),
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
