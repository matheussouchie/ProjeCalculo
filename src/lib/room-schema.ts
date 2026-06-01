import { z } from "zod";

export const userRoomSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(2, "Informe um nome com pelo menos 2 caracteres.")
    .max(80, "Use um nome mais curto."),
  description: z.string().trim().max(160, "Use uma descrição mais curta.").optional(),
  complexityWeight: z.coerce
    .number<number>()
    .min(0.5, "O peso mínimo é 0.5.")
    .max(3, "O peso máximo é 3.0.")
    .refine((value) => Number.isInteger(value * 10), {
      message: "Use incrementos de 0.1.",
    }),
  color: z
    .string()
    .trim()
    .regex(/^#([0-9a-fA-F]{6})$/, "Use uma cor hexadecimal válida.")
    .optional()
    .or(z.literal("")),
  isActive: z.coerce.boolean(),
});

export type UserRoomFormValues = z.infer<typeof userRoomSchema>;
