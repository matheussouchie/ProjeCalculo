import Link from "next/link";
import { Activity, CalendarDays, Gauge, Percent, TrendingUp } from "lucide-react";

import { AnalyticsMetricCard } from "@/components/analytics/analytics-metric-card";
import { EmptyAnalyticsState } from "@/components/analytics/empty-analytics-state";
import { PredictionErrorChart } from "@/components/analytics/prediction-error-chart";
import { ProductivityChart } from "@/components/analytics/productivity-chart";
import { ProjectHistoryList } from "@/components/analytics/project-history-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildDashboardAnalytics } from "@/services/analytics/dashboard-analytics.service";
import { getCurrentUserAnalytics } from "@/services/analytics/user-analytics.queries";

export default async function DashboardPage() {
  const { projects, statistics } = await getCurrentUserAnalytics();
  const analytics = buildDashboardAnalytics(projects, statistics);
  const hasTrend = analytics.productivityTrend.length > 0;

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-3xl">
          <h2 className="mt-4">Visão geral</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Acompanhe produtividade, precisão e histórico para entender como o
            OnTime² está aprendendo com seus projetos concluídos.
          </p>
        </div>
        <Button asChild>
          <Link href="/calcular-prazo">Calcular novo prazo</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCard
          title="Produtividade média"
          value={`${analytics.averageProductivity} m²/dia`}
          description="Base usada para novas previsões."
          icon={TrendingUp}
          tone="success"
        />
        <AnalyticsMetricCard
          title="Precisão histórica"
          value={`${analytics.predictionAccuracyPercent}%`}
          description={`Confiança ${analytics.confidenceLabel.toLowerCase()}.`}
          icon={Gauge}
        />
        <AnalyticsMetricCard
          title="Erro médio"
          value={`${analytics.averageErrorPercent}%`}
          description="Diferença entre previsto e realizado."
          icon={Percent}
          tone={analytics.averageErrorPercent <= 18 ? "success" : "warning"}
        />
        <AnalyticsMetricCard
          title="Tempo médio"
          value={`${analytics.averageDays} dias`}
          description={`${analytics.completedProjects} projetos concluídos.`}
          icon={CalendarDays}
        />
      </div>

      {hasTrend ? (
        <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Evolução da produtividade</CardTitle>
                <Activity className="size-4 text-muted-foreground" aria-hidden="true" />
              </div>
            </CardHeader>
            <CardContent>
              <ProductivityChart data={analytics.productivityTrend} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Precisão das previsões</CardTitle>
            </CardHeader>
            <CardContent>
              <PredictionErrorChart data={analytics.productivityTrend} />
            </CardContent>
          </Card>
        </div>
      ) : (
        <EmptyAnalyticsState />
      )}

      <ProjectHistoryList projects={analytics.recentProjects} />
    </section>
  );
}

