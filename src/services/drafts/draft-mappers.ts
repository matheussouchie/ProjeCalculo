import type { Database } from "@/types/database";
import type { DraftRecord, DraftScope } from "@/types/draft";

type DraftRow = Database["public"]["Tables"]["drafts"]["Row"];

export function mapDraftRow<TPayload>(row: DraftRow): DraftRecord<TPayload> {
  return {
    id: row.id,
    scope: row.scope as DraftScope,
    entityId: row.entity_id,
    payload: row.payload as TPayload,
    updatedAt: row.updated_at,
  };
}
