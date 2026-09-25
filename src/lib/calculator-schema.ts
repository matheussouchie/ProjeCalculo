import { z } from "zod";

const squareMetersSchema = z.coerce
  .number<number>()
  .min(0)
  .max(500)
  .refine((value) => Number.isInteger(Math.round(value * 10000)), {
    message: "Use no máximo 4 casas decimais.",
  });

export const calculatorRoomSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  roomLabel: z.string().trim().max(80).optional(),
  complexityWeight: z.coerce.number<number>().min(0.5).max(3),
  quantity: z.coerce.number<number>().int().min(1).max(1),
  squareMeters: squareMetersSchema,
  observation: z.string().max(160).optional(),
});

export const deadlineCalculatorSchema = z.object({
  projectId: z.string().uuid().optional(),
  projectName: z.string().trim().max(80).optional(),
  calculationMode: z.enum(["rooms", "total_area"]),
  totalSquareMeters: squareMetersSchema.optional(),
  rooms: z.array(calculatorRoomSchema),
}).superRefine((values, context) => {
  if (values.calculationMode === "rooms" && values.rooms.length === 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["rooms"], message: "Adicione ao menos um ambiente." });
  }
  if (values.calculationMode === "total_area" && !(values.totalSquareMeters && values.totalSquareMeters > 0)) {
    context.addIssue({ code: z.ZodIssueCode.custom, path: ["totalSquareMeters"], message: "Informe uma metragem total maior que zero." });
  }
});

export type DeadlineCalculatorValues = z.infer<typeof deadlineCalculatorSchema>;
