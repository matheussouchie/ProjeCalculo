import { INITIAL_PRODUCTIVITY_BASE } from "@/constants/initial-history";
import type { Database } from "@/types/database";
import { roundToOneDecimal } from "@/utils/number";

type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];
type UserStatisticsRow = Database["public"]["Tables"]["user_statistics"]["Row"];

export type AnalyticsProject = Pick<
  ProjectRow,
  | "id"
  | "name"
  | "total_square_meters"
  | "predicted_days"
  | "actual_days"
  | "complexity_score"
  | "created_at"
  | "completed_at"
>;

export type AnalyticsTrendPoint = {
  label: string;
  date: string;
  projectName: string;
  productivity: number;
  predictedDays: number;
  actualDays: number;
  errorPercent: number;
  squareMeters: number;
};

export type AnalyticsSummary = {
  totalProjects: number;
  completedProjects: number;
  averageProductivity: number;
  averageDays: number;
  averageErrorPercent: number;
  predictionAccuracyPercent: number;
  confidenceLabel: "Alta" | "Média" | "Inicial";
  productivityTrend: AnalyticsTrendPoint[];
  recentProjects: AnalyticsProject[];
};

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function isCompletedProject(project: AnalyticsProject) {
  return Boolean(
    project.actual_days && project.actual_days > 0 && project.completed_at,
  );
}

function getProjectDate(project: AnalyticsProject) {
  return new Date(project.completed_at ?? project.created_at);
}

function getErrorPercent(project: AnalyticsProject) {
  if (!project.actual_days || project.predicted_days <= 0) {
    return 0;
  }

  const errorRatio =
    Math.abs(project.actual_days - project.predicted_days) / project.predicted_days;

  return roundToOneDecimal(errorRatio * 100);
}

function getConfidenceLabel(completedProjects: number, accuracyPercent: number) {
  if (completedProjects < 2) {
    return "Inicial";
  }

  if (accuracyPercent >= 82) {
    return "Alta";
  }

  return "Média";
}

export function buildDashboardAnalytics(
  projects: AnalyticsProject[],
  statistics: UserStatisticsRow | null,
): AnalyticsSummary {
  const completedProjects = projects
    .filter(isCompletedProject)
    .sort(
      (left, right) => getProjectDate(left).getTime() - getProjectDate(right).getTime(),
    );

  const averageProductivity = roundToOneDecimal(
    statistics?.average_productivity ??
      INITIAL_PRODUCTIVITY_BASE.averageSquareMetersPerDay,
  );
  const averageDays = roundToOneDecimal(
    statistics?.average_days ?? INITIAL_PRODUCTIVITY_BASE.completedProjects * 11,
  );
  const averageErrorPercent = roundToOneDecimal(
    (statistics?.average_error_margin ??
      1 - INITIAL_PRODUCTIVITY_BASE.historicalAccuracy) * 100,
  );
  const predictionAccuracyPercent = roundToOneDecimal(
    clamp(100 - averageErrorPercent, 0, 100),
  );

  const productivityTrend = completedProjects.map((project) => {
    const actualDays = project.actual_days ?? 1;
    const projectDate = getProjectDate(project);

    return {
      label: DATE_FORMATTER.format(projectDate),
      date: projectDate.toISOString(),
      projectName: project.name,
      productivity: roundToOneDecimal(project.total_square_meters / actualDays),
      predictedDays: project.predicted_days,
      actualDays,
      errorPercent: getErrorPercent(project),
      squareMeters: roundToOneDecimal(project.total_square_meters),
    };
  });

  return {
    totalProjects: projects.length,
    completedProjects: completedProjects.length,
    averageProductivity,
    averageDays,
    averageErrorPercent,
    predictionAccuracyPercent,
    confidenceLabel: getConfidenceLabel(
      completedProjects.length,
      predictionAccuracyPercent,
    ),
    productivityTrend,
    recentProjects: [...projects]
      .sort(
        (left, right) =>
          getProjectDate(right).getTime() - getProjectDate(left).getTime(),
      )
      .slice(0, 6),
  };
}
