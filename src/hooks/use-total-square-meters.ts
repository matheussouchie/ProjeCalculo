import { useMemo } from "react";

import { roundToTwoDecimals } from "@/utils/number";

type RoomWithSquareMeters = {
  squareMeters: number;
};

export function useTotalSquareMeters(rooms: RoomWithSquareMeters[] | undefined) {
  return useMemo(() => {
    const total = (rooms ?? []).reduce(
      (sum, room) => sum + Number(room.squareMeters),
      0,
    );

    return roundToTwoDecimals(total);
  }, [rooms]);
}
