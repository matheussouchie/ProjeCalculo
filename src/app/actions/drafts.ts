"use server";

import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

const draftScopeSchema = z.enum(["calculate_deadline", "completed_project"]);
const draftPayloadSchema = z.record(z.string(), z.unknown());

export type DraftActionState = {
  ok: boolean;
  message?: string;
};

export async function saveDraftAction(values: {
  scope: unknown;
  entityId?: string | null;
  payload: unknown;
}): Promise<DraftActionState> {
  const scope = draftScopeSchema.safeParse(values.scope);
  const payload = draftPayloadSchema.safeParse(values.payload);

  if (!scope.success || !payload.success) {
    return {
      ok: false,
      message: "Erro ao salvar projeto",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Falha de conexão detectada",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Sessão expirada.",
    };
  }

  const entityId = values.entityId ?? null;
  const existingDraftQuery = supabase
    .from("drafts")
    .select("id")
    .eq("user_id", user.id)
    .eq("scope", scope.data)
    .limit(1);
  const { data: existingDraft } = await (
    entityId
      ? existingDraftQuery.eq("entity_id", entityId)
      : existingDraftQuery.is("entity_id", null)
  ).maybeSingle();

  const draftPayload = {
    scope: scope.data,
    entity_id: entityId,
    payload: payload.data as Json,
  };
  const insertPayload = {
    user_id: user.id,
    ...draftPayload,
  };
  const response = existingDraft
    ? await supabase.from("drafts").update(draftPayload).eq("id", existingDraft.id)
    : await supabase.from("drafts").insert(insertPayload);

  if (response.error) {
    return {
      ok: false,
      message: "Erro ao salvar projeto",
    };
  }

  return {
    ok: true,
    message: "Projeto salvo automaticamente",
  };
}

export async function discardDraftAction(values: {
  scope: unknown;
  entityId?: string | null;
}): Promise<DraftActionState> {
  const scope = draftScopeSchema.safeParse(values.scope);

  if (!scope.success) {
    return {
      ok: false,
      message: "Erro ao salvar projeto",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Falha de conexão detectada",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Sessão expirada.",
    };
  }

  const entityId = values.entityId ?? null;
  const deleteQuery = supabase
    .from("drafts")
    .delete()
    .eq("user_id", user.id)
    .eq("scope", scope.data);
  const response = await (entityId
    ? deleteQuery.eq("entity_id", entityId)
    : deleteQuery.is("entity_id", null));

  if (response.error) {
    return {
      ok: false,
      message: "Erro ao salvar projeto",
    };
  }

  return {
    ok: true,
    message: "Projeto atualizado com sucesso",
  };
}
