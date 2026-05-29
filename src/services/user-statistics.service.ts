import { INITIAL_PRODUCTIVITY_BASE } from "@/constants/initial-history";
import type { Database } from "@/types/database";
import type { ProductivityProfile } from "@/types/project";

type UserStatisticsRow = Database["public"]["Tables"]["user_statistics"]["Row"];

export function mapStatisticsToProductivityProfile(
  statistics: UserStatisticsRow | null,
): ProductivityProfile {
  if (!statistics || statistics.total_projects < 2) {
    return {
      averageSquareMetersPerDay: Number(
        INITIAL_PRODUCTIVITY_BASE.averageSquareMetersPerDay.toFixed(1),
      ),
      completedProjects: INITIAL_PRODUCTIVITY_BASE.completedProjects,
      historicalAccuracy: INITIAL_PRODUCTIVITY_BASE.historicalAccuracy,
    };
  }

  return {
    averageSquareMetersPerDay: Number(statistics.average_productivity.toFixed(1)),
    completedProjects: statistics.total_projects,
    historicalAccuracy: Math.max(0.1, 1 - statistics.average_error_margin),
  };
}
