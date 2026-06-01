import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  getFallbackCalculatorRoomOptions,
  mapUserRoomToCalculatorOption,
  type UserRoom,
} from "@/services/user-rooms/user-room-mappers";

export async function getCurrentUserRooms() {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [] satisfies UserRoom[];
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [] satisfies UserRoom[];
  }

  const { data } = await supabase
    .from("user_rooms")
    .select("*")
    .eq("user_id", user.id)
    .order("is_active", { ascending: false })
    .order("name", { ascending: true });

  return data ?? [];
}

export async function getCurrentUserActiveRoomOptions() {
  const rooms = await getCurrentUserRooms();
  const activeRooms = rooms.filter((room) => room.is_active);

  if (activeRooms.length === 0) {
    return getFallbackCalculatorRoomOptions();
  }

  return activeRooms.map(mapUserRoomToCalculatorOption);
}
