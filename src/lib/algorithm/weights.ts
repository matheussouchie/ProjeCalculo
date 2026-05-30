import type { EnvironmentType } from "@/types/project";

export const PREDICTION_ROOM_WEIGHTS: Record<EnvironmentType, number> = {
  living: 1.4,
  integrated: 1.3,
  kitchen: 1.5,
  suite: 1.4,
  bathroom: 1.6,
  social_bathroom: 1.45,
  powder_room: 1.2,
  circulation: 0.6,
  living_room: 1.2,
  bedroom: 1.1,
  closet: 1.25,
  laundry: 1.1,
  balcony: 0.8,
  office: 1,
  commercial: 1.55,
  other: 1,
};

export function getRoomWeight(type: EnvironmentType) {
  return PREDICTION_ROOM_WEIGHTS[type] ?? PREDICTION_ROOM_WEIGHTS.other;
}
