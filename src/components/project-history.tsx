import { CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { HistoricalProject } from "@/types/project";

const statusLabels: Record<HistoricalProject["status"], string> = {
  estimating: "Estimando",
  in_progress: "Em andamento",
  finished: "Finalizado",
};

export function ProjectHistory({ projects }: { projects: HistoricalProject[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="size-4 text-primary" aria-hidden="true" />
          Historico recente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {projects.map((project, index) => (
          <div key={project.id} className="space-y-4">
            <article className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <h3 className="text-sm font-medium">{project.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {project.totalSquareMeters} m2 · previsto em {project.estimatedDays}{" "}
                  dias
                </p>
              </div>
              <div className="flex items-center gap-2 sm:justify-end">
                <Badge
                  variant={project.status === "finished" ? "success" : "secondary"}
                >
                  {statusLabels[project.status]}
                </Badge>
                {project.actualDays ? (
                  <span className="font-sans text-sm text-muted-foreground">
                    real {project.actualDays}d
                  </span>
                ) : null}
              </div>
            </article>
            {index < projects.length - 1 ? <Separator /> : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
