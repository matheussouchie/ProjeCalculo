"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  deleteEstimateAction,
  duplicateEstimateAction,
  type SavedEstimateActionState,
} from "@/app/actions/projects";
import { ActionIcon } from "@/components/ui/action-icon";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SavedEstimate } from "@/services/estimates/estimate-mappers";

type SavedEstimatesListProps = {
  estimates: SavedEstimate[];
  onEdit: (estimate: SavedEstimate) => void;
};

const DATE_FORMATTER = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value: string) {
  return DATE_FORMATTER.format(new Date(value));
}

export function SavedEstimatesList({ estimates, onEdit }: SavedEstimatesListProps) {
  const router = useRouter();
  const [state, setState] = useState<SavedEstimateActionState>({ ok: false });
  const [isPending, startTransition] = useTransition();

  function duplicateEstimate(projectId: string) {
    startTransition(async () => {
      setState(await duplicateEstimateAction(projectId));
      router.refresh();
    });
  }

  function deleteEstimate(projectId: string) {
    const confirmed = window.confirm("Excluir esta estimativa?");

    if (!confirmed) {
      return;
    }

    startTransition(async () => {
      setState(await deleteEstimateAction(projectId));
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimativas salvas</CardTitle>
        <p className="text-sm text-muted-foreground">
          Edite, duplique ou exclua estimativas importantes sem perder contexto.
        </p>
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

        {estimates.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center">
            <p className="font-medium">Nenhuma estimativa salva ainda.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Calcule um prazo e salve para acompanhar depois.
            </p>
          </div>
        ) : (
          estimates.map((estimate) => (
            <article
              key={estimate.id}
              className="grid gap-4 rounded-lg border bg-background p-4 transition-colors hover:bg-muted/30 lg:grid-cols-[1fr_140px_120px_150px_auto] lg:items-center"
            >
              <div>
                <h3 className="text-base">{estimate.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Criado em {formatDate(estimate.createdAt)}
                </p>
              </div>
              <Metric label="Metragem" value={`${estimate.totalSquareMeters} m²`} />
              <Metric label="Previsto" value={`${estimate.predictedDays} dias`} />
              <Metric label="Atualizado" value={formatDate(estimate.updatedAt)} />
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Editar estimativa"
                  onClick={() => onEdit(estimate)}
                  disabled={isPending}
                >
                  <ActionIcon name="edit" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Duplicar estimativa"
                  onClick={() => duplicateEstimate(estimate.id)}
                  disabled={isPending}
                >
                  <ActionIcon name="copy" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  title="Excluir estimativa"
                  onClick={() => deleteEstimate(estimate.id)}
                  disabled={isPending}
                >
                  <ActionIcon name="delete" />
                </Button>
              </div>
            </article>
          ))
        )}
      </CardContent>
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
