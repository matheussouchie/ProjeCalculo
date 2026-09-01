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
import { cn } from "@/lib/utils";
import type { AnalyticsProject } from "@/services/analytics/dashboard-analytics.service";
import { roundToOneDecimal } from "@/utils/number";

type ProjectHistoryListProps = {
  projects: AnalyticsProject[];
  title?: string;
  description?: string;
  showActions?: boolean;
  appearance?: "default" | "dashboard";
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
  description,
  showActions = false,
  appearance = "default",
}: ProjectHistoryListProps) {
  const router = useRouter();
  const [state, setState] = useState<ProjectActionState>({ ok: false });
  const [deleteTarget, setDeleteTarget] = useState<AnalyticsProject | null>(null);
  const [isPending, startTransition] = useTransition();
  const isDashboard = appearance === "dashboard";

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
    <Card
      className={cn(
        isDashboard &&
          "gap-0 border-0 bg-[#f5f1f7] py-5 shadow-[var(--shadow-card)] dark:bg-[#80658c]",
      )}
    >
      <CardHeader className={cn(isDashboard && "gap-5 px-[30px] pb-5")}>
        <CardTitle>{title}</CardTitle>
        {description ? (
          <p className="text-sm leading-none text-foreground">{description}</p>
        ) : null}
      </CardHeader>
      <CardContent className={cn("space-y-3", isDashboard && "space-y-5 px-[30px]")}>
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
          <p
            className={cn(
              "rounded-lg border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground",
              isDashboard && "border-0 bg-card text-foreground/70 dark:bg-[#53575e]",
            )}
          >
            Nenhum projeto registrado ainda.
          </p>
        ) : (
          projects.map((project) => (
            <article
              key={project.id}
              className={cn(
                "grid gap-4 rounded-lg border bg-background/60 p-4 transition-colors hover:bg-muted/30 xl:grid-cols-[minmax(0,1fr)_140px_120px_150px_auto] xl:items-center",
                isDashboard &&
                  "min-h-[82px] rounded-md border-0 bg-card px-[30px] py-[15px] dark:bg-[#53575e] xl:grid-cols-[minmax(220px,1fr)_125px_125px_135px_122px] xl:items-center",
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    className={cn("text-base", isDashboard && "text-lg leading-none")}
                  >
                    {project.name}
                  </h3>
                  {!isDashboard ? (
                    <Badge variant="secondary">{getProjectStatus(project)}</Badge>
                  ) : null}
                </div>
                <p className="mt-[15px] text-xs leading-none text-muted-foreground dark:text-[#dddade]">
                  {isDashboard ? "Criado em " : ""}
                  {formatDate(project.created_at)}
                </p>
              </div>

              <Metric
                label="Metragem"
                value={`${roundToOneDecimal(project.total_square_meters)}m²`}
                dashboard={isDashboard}
              />
              <Metric
                label="Previsto"
                value={`${getPredictedDays(project)} dias`}
                dashboard={isDashboard}
              />
              <Metric
                label={isDashboard ? "Atualizado em" : "Real"}
                value={
                  isDashboard
                    ? formatDate(project.updated_at)
                    : project.actual_days
                      ? `${project.actual_days} dias`
                      : "--"
                }
                dashboard={isDashboard}
              />

              {showActions ? (
                <div
                  className={cn(
                    "flex items-center justify-start gap-2 xl:justify-end",
                    isDashboard && "gap-[25px] xl:justify-end",
                  )}
                >
                  <Button
                    asChild
                    variant={isDashboard ? "ghost" : "outline"}
                    size="icon"
                    className={cn(
                      "group",
                      isDashboard &&
                        "size-6 rounded-none p-0 shadow-none hover:bg-transparent",
                    )}
                    title="Editar projeto"
                    aria-label="Editar projeto"
                  >
                    <Link href={`/registrar-projeto-concluido?projectId=${project.id}`}>
                      <ActionIcon name="edit" />
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant={isDashboard ? "ghost" : "outline"}
                    size="icon"
                    className={cn(
                      "group",
                      isDashboard &&
                        "size-6 rounded-none p-0 shadow-none hover:bg-transparent",
                    )}
                    title="Duplicar projeto"
                    aria-label="Duplicar projeto"
                    onClick={() => duplicateProject(project.id)}
                    disabled={isPending}
                  >
                    <ActionIcon name="copy" />
                  </Button>
                  <Button
                    type="button"
                    variant={isDashboard ? "ghost" : "outline"}
                    size="icon"
                    className={cn(
                      "group",
                      isDashboard &&
                        "size-6 rounded-none p-0 shadow-none hover:bg-transparent",
                    )}
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

function Metric({
  label,
  value,
  dashboard = false,
}: {
  label: string;
  value: string;
  dashboard?: boolean;
}) {
  return (
    <div>
      <p
        className={cn(
          "text-xs text-muted-foreground",
          dashboard && "text-lg font-semibold leading-none text-foreground",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-sans text-sm font-semibold",
          dashboard && "mt-[15px] text-xs font-normal leading-none",
        )}
      >
        {value}
      </p>
    </div>
  );
}
