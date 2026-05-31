type AdjustableRoom = {
  squareMeters: number;
  quantity?: number;
};

export function redistributeRoomAreasToTotal<TRoom extends AdjustableRoom>(
  rooms: TRoom[],
  targetTotalSquareMeters: number,
) {
  if (rooms.length === 0 || targetTotalSquareMeters <= 0) {
    return rooms;
  }

  const currentTotal = rooms.reduce(
    (total, room) => total + room.squareMeters * (room.quantity ?? 1),
    0,
  );
  const totalQuantity = rooms.reduce((total, room) => total + (room.quantity ?? 1), 0);

  if (currentTotal <= 0) {
    const squareMetersPerUnit = targetTotalSquareMeters / Math.max(totalQuantity, 1);

    return rooms.map((room) => ({
      ...room,
      squareMeters: Number(squareMetersPerUnit.toFixed(4)),
    }));
  }

  const ratio = targetTotalSquareMeters / currentTotal;

  return rooms.map((room) => ({
    ...room,
    squareMeters: Number((room.squareMeters * ratio).toFixed(4)),
  }));
}
