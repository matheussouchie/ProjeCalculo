import { CheckCircle2, TrendingUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { environmentLabels } from "@/lib/project-options";
import type { ProjectEstimate } from "@/types/project";

export function EstimateResult({ estimate }: { estimate: ProjectEstimate }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Previsao recomendada</p>
            <CardTitle className="mt-2 text-4xl">
              {estimate.recommendedDays} dias
            </CardTitle>
          </div>
          <Badge variant="secondary">{estimate.confidence}% confianca</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted p-2">
          <Metric label="Otimista" value={`${estimate.range.optimistic}d`} />
          <Metric label="Realista" value={`${estimate.range.realistic}d`} />
          <Metric label="Conservador" value={`${estimate.range.conservative}d`} />
        </div>

        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-medium">
            <TrendingUp className="size-4 text-primary" aria-hidden="true" />
            Impacto por ambiente
          </h3>
          <div className="space-y-3">
            {estimate.environments.map((environment) => (
              <div key={environment.id} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span>{environment.name}</span>
                  <span className="font-mono text-muted-foreground">
                    {environment.estimatedDays}d
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${Math.min(
                        (environment.weightedSquareMeters /
                          estimate.weightedSquareMeters) *
                          100,
                        100,
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {environmentLabels[environment.type]} · peso {environment.weight} ·{" "}
                  {environment.weightedSquareMeters} m2 ponderados
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {estimate.insights.map((insight) => (
            <p
              key={insight}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <CheckCircle2
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              {insight}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-background p-3 text-center">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold">{value}</p>
    </div>
  );
}
