import Link from "next/link";

import { AnalyticsMetricCard } from "@/components/analytics/analytics-metric-card";
import { ProjectHistoryList } from "@/components/analytics/project-history-list";
import { Button } from "@/components/ui/button";
import { buildDashboardAnalytics } from "@/services/analytics/dashboard-analytics.service";
import { getCurrentUserAnalytics } from "@/services/analytics/user-analytics.queries";

export default async function DashboardPage() {
  const { projects, statistics } = await getCurrentUserAnalytics();
  const analytics = buildDashboardAnalytics(projects, statistics);

  return (
    <section className="flex flex-col gap-12 lg:gap-[84px] lg:pt-[39px] lg:pb-[39px]">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-[737px]">
          <h2 className="leading-none">Visão Geral</h2>
          <p className="mt-[14px] text-base leading-tight text-foreground">
            Acompanhe produtividade, precisão e histórico para entender como o OnTime²
            está aprendendo com seus projetos concluídos.
          </p>
        </div>
        <Button asChild className="w-fit text-xl">
          <Link href="/calcular-prazo">Calcular novo prazo</Link>
        </Button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-[clamp(24px,3.5vw,54px)]">
        <AnalyticsMetricCard
          title="Produtividade média"
          value={`${analytics.averageProductivity}m²/dia`}
          description="Utilizado para novas previsões"
          appearance="dashboard"
        />
        <AnalyticsMetricCard
          title="Precisão histórica"
          value={`${analytics.predictionAccuracyPercent}%`}
          description={`Confiança ${analytics.confidenceLabel}`}
          appearance="dashboard"
        />
        <AnalyticsMetricCard
          title="Erro médio"
          value={`${analytics.averageErrorPercent}%`}
          description="Diferença entre previsto e realizado"
          appearance="dashboard"
        />
        <AnalyticsMetricCard
          title="Tempo médio"
          value={`${analytics.averageDays} dias`}
          description={`${analytics.completedProjects} projetos concluídos`}
          appearance="dashboard"
        />
      </div>

      <ProjectHistoryList
        projects={analytics.recentProjects.slice(0, 3)}
        title="Últimas estimativas salvas"
        description="Visualize, edite, duplique ou exclua estimativas importantes sem perder contexto."
        showActions
        appearance="dashboard"
      />
    </section>
  );
}
