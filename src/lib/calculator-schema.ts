import { z } from "zod";

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
  quantity: z.coerce.number<number>().int().min(1).max(20),
  squareMeters: z.coerce.number<number>().min(0).max(500),
  observation: z.string().max(160).optional(),
});

export const deadlineCalculatorSchema = z.object({
  rooms: z.array(calculatorRoomSchema),
});

export type DeadlineCalculatorValues = z.infer<typeof deadlineCalculatorSchema>;
