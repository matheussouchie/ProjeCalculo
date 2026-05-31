import { z } from "zod";

const squareMetersSchema = z.coerce
  .number<number>()
  .min(0)
  .max(500)
  .refine((value) => Number.isInteger(value * 10000), {
    message: "Use no máximo 4 casas decimais.",
  });

export const calculatorRoomSchema = z.object({
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
  observation: z.string().max(160).optional(),
});

export const deadlineCalculatorSchema = z.object({
  projectId: z.string().uuid().optional(),
  projectName: z.string().trim().max(80).optional(),
  rooms: z.array(calculatorRoomSchema),
});

export type DeadlineCalculatorValues = z.infer<typeof deadlineCalculatorSchema>;
