import { calculatorRoomOptions } from "@/constants/calculator-rooms";
import type { DeadlineCalculatorValues } from "@/lib/calculator-schema";
import type { Database } from "@/types/database";

type ProjectRoomRow = Database["public"]["Tables"]["project_rooms"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export type SavedEstimateRoom = {
  id: string;
  type: DeadlineCalculatorValues["rooms"][number]["type"];
  roomLabel: string;
  squareMeters: number;
  observation?: string;
};

export type SavedEstimate = {
  id: string;
  name: string;
  totalSquareMeters: number;
  predictedDays: number;
  complexityScore: number;
  createdAt: string;
  updatedAt: string;
  rooms: SavedEstimateRoom[];
};

type ProjectWithRooms = Pick<
  ProjectRow,
  | "id"
  | "name"
  | "total_square_meters"
  | "predicted_days"
  | "complexity_score"
  | "created_at"
  | "updated_at"
> & {
  project_rooms: ProjectRoomRow[];
};

export function mapSavedEstimate(project: ProjectWithRooms): SavedEstimate {
  return {
    id: project.id,
    name: project.name,
    totalSquareMeters: project.total_square_meters,
    predictedDays: project.predicted_days,
    complexityScore: project.complexity_score,
    createdAt: project.created_at,
    updatedAt: project.updated_at,
    rooms: project.project_rooms.map((room) => ({
      id: room.id,
      type: room.room_type as DeadlineCalculatorValues["rooms"][number]["type"],
      roomLabel: room.room_label,
      squareMeters: room.square_meters,
    })),
  };
}

export function mapEstimateToCalculatorValues(
  estimate: SavedEstimate,
): DeadlineCalculatorValues {
  return {
    projectId: estimate.id,
    projectName: estimate.name,
    rooms: estimate.rooms.map((room) => ({
      id: room.id,
      type: room.type,
      roomLabel: room.roomLabel,
      quantity: 1,
      squareMeters: room.squareMeters,
      observation: "",
    })),
  };
}

export function getEstimateRoomFallbackLabel(
  type: DeadlineCalculatorValues["rooms"][number]["type"],
) {
  return (
    calculatorRoomOptions.find((option) => option.type === type)?.label ?? "Ambiente"
  );
}
