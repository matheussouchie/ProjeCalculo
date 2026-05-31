import { calculatorRoomOptions } from "@/constants/calculator-rooms";
import type { CalculatorRoomType } from "@/constants/calculator-rooms";

type RoomWithLabel = {
  id: string;
  type: CalculatorRoomType;
  roomLabel?: string;
};

function getRoomTypeLabel(type: CalculatorRoomType) {
  return (
    calculatorRoomOptions.find((option) => option.type === type)?.label ?? "Ambiente"
  );
}

function getRoomSequence(type: CalculatorRoomType, rooms: RoomWithLabel[], id: string) {
  const sameTypeRooms = rooms.filter((room) => room.type === type);
  const index = sameTypeRooms.findIndex((room) => room.id === id);

  return Math.max(index + 1, sameTypeRooms.length);
}

export function generateRoomLabel(
  type: CalculatorRoomType,
  rooms: RoomWithLabel[],
  id: string,
) {
  const sequence = String(getRoomSequence(type, rooms, id)).padStart(2, "0");

  return `${getRoomTypeLabel(type)} ${sequence}`;
}

export function resolveRoomLabel(room: RoomWithLabel, rooms: RoomWithLabel[]) {
  const customLabel = room.roomLabel?.trim();

  if (customLabel) {
    return customLabel;
  }

  return generateRoomLabel(room.type, rooms, room.id);
}
