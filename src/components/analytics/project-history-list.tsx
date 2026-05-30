import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsProject } from "@/services/analytics/dashboard-analytics.service";
import { roundToOneDecimal } from "@/utils/number";

type ProjectHistoryListProps = {
  projects: AnalyticsProject[];
  title?: string;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value: string | null) {
  if (!value) {
    return "Em andamento";
  }

  return DATE_FORMATTER.format(new Date(value));
}

function getProjectStatus(project: AnalyticsProject) {
  if (project.actual_days && project.completed_at) {
    return "Concluído";
  }

  return "Estimado";
}

export function ProjectHistoryList({
  projects,
  title = "Histórico recente",
}: ProjectHistoryListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {projects.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
            Nenhum projeto registrado ainda.
          </p>
        ) : (
          projects.map((project) => (
            <article
              key={project.id}
              className="flex flex-col gap-4 rounded-lg border bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base">{project.name}</h3>
                  <Badge variant="secondary">{getProjectStatus(project)}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(project.completed_at ?? project.created_at)}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-right sm:min-w-[320px]">
                <div>
                  <p className="text-xs text-muted-foreground">Metragem</p>
                  <p className="mt-1 font-medium">
                    {roundToOneDecimal(project.total_square_meters)} m²
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Previsto</p>
                  <p className="mt-1 font-medium">{project.predicted_days} dias</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Real</p>
                  <p className="mt-1 font-medium">
                    {project.actual_days ? `${project.actual_days} dias` : "--"}
                  </p>
                </div>
              </div>
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
