import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapDraftRow } from "@/services/drafts/draft-mappers";
import type { DraftRecord, DraftScope } from "@/types/draft";

export async function getCurrentUserDraft<TPayload>(
  scope: DraftScope,
  entityId?: string | null,
): Promise<DraftRecord<TPayload> | null> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  let query = supabase
    .from("drafts")
    .select("*")
    .eq("user_id", user.id)
    .eq("scope", scope)
    .order("updated_at", { ascending: false })
    .limit(1);

  query = entityId ? query.eq("entity_id", entityId) : query.is("entity_id", null);

  const { data } = await query.maybeSingle();

  return data ? mapDraftRow<TPayload>(data) : null;
}
