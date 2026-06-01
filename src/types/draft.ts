import type { Json } from "@/types/database";

export type DraftScope = "calculate_deadline" | "completed_project";

export type DraftRecord<TPayload = Json> = {
  id: string;
  scope: DraftScope;
  entityId: string | null;
  payload: TPayload;
  updatedAt: string;
};
