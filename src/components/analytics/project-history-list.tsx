"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteProjectAction,
  duplicateProjectAction,
  type ProjectActionState,
} from "@/app/actions/projects";
import { Badge } from "@/components/ui/badge";
import { ActionIcon } from "@/components/ui/action-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsProject } from "@/services/analytics/dashboard-analytics.service";
import { roundToOneDecimal } from "@/utils/number";

type ProjectHistoryListProps = {
  projects: AnalyticsProject[];
  title?: string;
  showActions?: boolean;
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

function getPredictedDays(project: AnalyticsProject) {
  return project.prediction?.[0]?.predicted_days ?? project.predicted_days;
}

export function ProjectHistoryList({
  projects,
  title = "Histórico recente",
  showActions = false,
}: ProjectHistoryListProps) {
  const router = useRouter();
  const [state, setState] = useState<ProjectActionState>({ ok: false });
  const [deleteTarget, setDeleteTarget] = useState<AnalyticsProject | null>(null);
  const [isPending, startTransition] = useTransition();

  function duplicateProject(projectId: string) {
    startTransition(async () => {
      setState(await duplicateProjectAction(projectId));
      router.refresh();
    });
  }

  function deleteProject(projectId: string) {
    startTransition(async () => {
      setState(await deleteProjectAction(projectId));
      setDeleteTarget(null);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {state.message ? (
          <p
            className={
              state.ok
                ? "rounded-sm border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700"
                : "rounded-sm border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            }
          >
            {state.message}
          </p>
        ) : null}

        {projects.length === 0 ? (
          <p className="rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
            Nenhum projeto registrado ainda.
          </p>
        ) : (
          projects.map((project) => (
            <article
              key={project.id}
              className="grid gap-4 rounded-lg border bg-background/60 p-4 transition-colors hover:bg-muted/30 xl:grid-cols-[minmax(0,1fr)_140px_120px_150px_auto] xl:items-center"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base">{project.name}</h3>
                  <Badge variant="secondary">{getProjectStatus(project)}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatDate(project.completed_at ?? project.created_at)}
                </p>
              </div>

              <Metric
                label="Metragem"
                value={`${roundToOneDecimal(project.total_square_meters)} m²`}
              />
              <Metric label="Previsto" value={`${getPredictedDays(project)} dias`} />
              <Metric
                label="Real"
                value={project.actual_days ? `${project.actual_days} dias` : "--"}
              />

              {showActions ? (
                <div className="flex items-center justify-start gap-2 xl:justify-end">
                  <Button
                    asChild
                    variant="outline"
                    size="icon"
                    title="Editar projeto"
                    aria-label="Editar projeto"
                  >
                    <Link href={`/registrar-projeto-concluido?projectId=${project.id}`}>
                      <ActionIcon name="edit" />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Duplicar projeto"
                    aria-label="Duplicar projeto"
                    onClick={() => duplicateProject(project.id)}
                    disabled={isPending}
                  >
                    <ActionIcon name="copy" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Excluir projeto"
                    aria-label="Excluir projeto"
                    onClick={() => setDeleteTarget(project)}
                    disabled={isPending}
                  >
                    <ActionIcon name="delete" />
                  </Button>
                </div>
              ) : null}
            </article>
          ))
        )}
      </CardContent>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
            className="w-full max-w-md rounded-lg border bg-card p-6 shadow-[var(--shadow-soft)]"
          >
            <h3 id="delete-project-title">Excluir projeto?</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Esta ação remove permanentemente o projeto e seus ambientes.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => deleteProject(deleteTarget.id)}
                disabled={isPending}
              >
                Excluir
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-sans text-sm font-semibold">{value}</p>
    </div>
  );
}
