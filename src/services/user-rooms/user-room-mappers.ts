import { calculatorRoomOptions } from "@/constants/calculator-rooms";
import type { CalculatorRoomOption } from "@/constants/calculator-rooms";
import type { Database } from "@/types/database";

export type UserRoom = Database["public"]["Tables"]["user_rooms"]["Row"];

export function mapUserRoomToCalculatorOption(
  room: Pick<
    UserRoom,
    "id" | "name" | "description" | "complexity_weight" | "color" | "system_key"
  >,
): CalculatorRoomOption {
  return {
    type: room.id,
    label: room.name,
    description: room.description ?? "Ambiente personalizado",
    defaultSquareMeters: 10,
    complexityWeight: room.complexity_weight,
    color: room.color,
    systemKey: room.system_key,
  };
}

export function getFallbackCalculatorRoomOptions() {
  return calculatorRoomOptions;
}
