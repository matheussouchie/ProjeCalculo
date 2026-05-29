import { Activity, BadgeCheck, Gauge } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ProductivityProfile } from "@/types/project";

type ProductivitySummaryProps = {
  profile: ProductivityProfile;
};

const metrics = [
  {
    key: "productivity",
    label: "Produtividade",
    icon: Gauge,
    getValue: (profile: ProductivityProfile) =>
      `${profile.averageSquareMetersPerDay} m2/dia`,
  },
  {
    key: "projects",
    label: "Projetos finalizados",
    icon: BadgeCheck,
    getValue: (profile: ProductivityProfile) => profile.completedProjects,
  },
  {
    key: "accuracy",
    label: "Confianca historica",
    icon: Activity,
    getValue: (profile: ProductivityProfile) =>
      `${Math.round(profile.historicalAccuracy * 100)}%`,
  },
];

export function ProductivitySummary({ profile }: ProductivitySummaryProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <Card key={metric.key} className="gap-4 py-5">
            <CardHeader className="flex grid-cols-none flex-row items-center justify-between px-5">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
              <Icon className="size-4 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent className="px-5">
              <p className="text-2xl font-semibold tracking-normal">
                {metric.getValue(profile)}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
