"use server";

import { revalidatePath } from "next/cache";

import { userRoomSchema } from "@/lib/room-schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type UserRoomActionState = {
  ok: boolean;
  message?: string;
};

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function getRoomPayload(formData: FormData) {
  return userRoomSchema.safeParse({
    id: getString(formData, "id") || undefined,
    name: getString(formData, "name"),
    description: getString(formData, "description") || undefined,
    complexityWeight: getString(formData, "complexityWeight"),
    color: getString(formData, "color"),
    isActive: formData.get("isActive") === "on",
  });
}

export async function upsertUserRoomAction(
  _state: UserRoomActionState,
  formData: FormData,
): Promise<UserRoomActionState> {
  const parsed = getRoomPayload(formData);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Revise os dados do ambiente.",
    };
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure o Supabase para salvar ambientes.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Entre na sua conta para salvar ambientes.",
    };
  }

  const payload = {
    name: parsed.data.name,
    description: parsed.data.description || null,
    complexity_weight: parsed.data.complexityWeight,
    color: parsed.data.color || null,
    is_active: parsed.data.isActive,
  };

  const response = parsed.data.id
    ? await supabase
        .from("user_rooms")
        .update(payload)
        .eq("id", parsed.data.id)
        .eq("user_id", user.id)
    : await supabase.from("user_rooms").insert({
        ...payload,
        user_id: user.id,
      });

  if (response.error) {
    return {
      ok: false,
      message: "Não foi possível salvar este ambiente.",
    };
  }

  revalidatePath("/ambientes");
  revalidatePath("/calcular-prazo");
  revalidatePath("/registrar-projeto-concluido");

  return {
    ok: true,
    message: parsed.data.id ? "Ambiente atualizado." : "Ambiente criado.",
  };
}

export async function deleteUserRoomAction(
  roomId: string,
): Promise<UserRoomActionState> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      ok: false,
      message: "Configure o Supabase para excluir ambientes.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      message: "Entre na sua conta para excluir ambientes.",
    };
  }

  const { error } = await supabase
    .from("user_rooms")
    .delete()
    .eq("id", roomId)
    .eq("user_id", user.id);

  if (error) {
    return {
      ok: false,
      message: "Não foi possível excluir este ambiente.",
    };
  }

  revalidatePath("/ambientes");
  revalidatePath("/calcular-prazo");
  revalidatePath("/registrar-projeto-concluido");

  return {
    ok: true,
    message: "Ambiente excluído.",
  };
}
