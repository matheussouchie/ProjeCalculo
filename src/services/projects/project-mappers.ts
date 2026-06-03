import type { CompletedProjectValues } from "@/lib/completed-project-schema";
import type { Database } from "@/types/database";

type ProjectRoomRow = Database["public"]["Tables"]["project_rooms"]["Row"];
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

type ProjectWithRooms = Pick<
  ProjectRow,
  | "id"
  | "prediction_id"
  | "name"
  | "total_square_meters"
  | "predicted_days"
  | "actual_days"
  | "complexity_score"
  | "created_at"
  | "updated_at"
  | "completed_at"
> & {
  project_rooms: ProjectRoomRow[];
};

export function mapProjectToCompletedProjectValues(
  project: ProjectWithRooms,
): CompletedProjectValues {
  return {
    projectId: project.id,
    predictionId: project.prediction_id ?? "",
    name: project.name,
    actualDays: project.actual_days ?? 1,
    rooms: project.project_rooms.map((room) => ({
      id: room.id,
      type: room.room_type,
      roomLabel: room.room_label,
      complexityWeight: room.weight_used,
      quantity: 1,
      squareMeters: room.square_meters,
    })),
  };
}

export function mapEstimateToCompletedProjectValues(
  estimate: {
    id: string;
    name: string;
    rooms: {
      id: string;
      type: string;
      roomLabel: string;
      complexityWeight: number;
      squareMeters: number;
    }[];
  },
): CompletedProjectValues {
  return {
    projectId: "",
    predictionId: estimate.id,
    name: estimate.name,
    actualDays: 1,
    rooms: estimate.rooms.map((room) => ({
      id: room.id,
      type: room.type,
      roomLabel: room.roomLabel,
      complexityWeight: room.complexityWeight,
      quantity: 1,
      squareMeters: room.squareMeters,
    })),
  };
}
