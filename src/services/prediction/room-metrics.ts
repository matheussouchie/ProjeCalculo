import { getRoomWeight } from "@/lib/algorithm";
import type { EnvironmentType } from "@/types/project";

export function getPredictionRoomMetrics(type: EnvironmentType) {
  const weight = getRoomWeight(type);

  return {
    weight,
    complexityPoints: weight,
  };
}
