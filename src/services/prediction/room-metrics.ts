import { getRoomWeight } from "@/lib/algorithm";
import type { EnvironmentType } from "@/types/project";

export function getPredictionRoomMetrics(type: EnvironmentType, customWeight?: number) {
  const weight = customWeight ?? getRoomWeight(type);

  return {
    weight,
    complexityPoints: weight,
  };
}
