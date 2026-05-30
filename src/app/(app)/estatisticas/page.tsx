import { BarChart3, CalendarCheck2, Clock3, Ruler, ShieldCheck } from "lucide-react";

import { AnalyticsMetricCard } from "@/components/analytics/analytics-metric-card";
import { EmptyAnalyticsState } from "@/components/analytics/empty-analytics-state";
import { PredictionErrorChart } from "@/components/analytics/prediction-error-chart";
import { ProductivityChart } from "@/components/analytics/productivity-chart";
import { ProjectHistoryList } from "@/components/analytics/project-history-list";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildDashboardAnalytics } from "@/services/analytics/dashboard-analytics.service";
import { getCurrentUserAnalytics } from "@/services/analytics/user-analytics.queries";

export default async function StatisticsPage() {
  const { projects, statistics } = await getCurrentUserAnalytics();
  const analytics = buildDashboardAnalytics(projects, statistics);

  return (
    <section className="space-y-6">
      <div className="max-w-3xl">
        <Badge variant="secondary">Estatísticas</Badge>
        <h2 className="mt-4">Inteligência de produtividade</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Uma leitura limpa da sua evolução: produtividade por metro quadrado, margem de
          erro, prazo médio e histórico usado para calibrar novas estimativas.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <AnalyticsMetricCard
          title="Projetos analisados"
          value={String(analytics.totalProjects)}
          description={`${analytics.completedProjects} concluídos alimentam o algoritmo.`}
          icon={CalendarCheck2}
        />
        <AnalyticsMetricCard
          title="Média produtiva"
          value={`${analytics.averageProductivity} m²/dia`}
          description="Média móvel com peso maior para recentes."
          icon={Ruler}
          tone="success"
        />
        <AnalyticsMetricCard
          title="Prazo médio"
          value={`${analytics.averageDays} dias`}
          description="Tempo real observado nos projetos concluídos."
          icon={Clock3}
        />
        <AnalyticsMetricCard
          title="Confiabilidade"
          value={analytics.confidenceLabel}
          description={`${analytics.predictionAccuracyPercent}% de precisão histórica.`}
          icon={ShieldCheck}
          tone={analytics.predictionAccuracyPercent >= 82 ? "success" : "neutral"}
        />
      </div>

      {analytics.productivityTrend.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle>Produtividade por projeto</CardTitle>
                <BarChart3
                  className="size-4 text-muted-foreground"
                  aria-hidden="true"
                />
              </div>
            </CardHeader>
            <CardContent>
              <ProductivityChart data={analytics.productivityTrend} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Erro percentual</CardTitle>
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
