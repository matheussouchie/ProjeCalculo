import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AnalyticsMetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone?: "neutral" | "success" | "warning";
};

const toneClasses = {
  neutral: "bg-primary/5 text-primary",
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

export function AnalyticsMetricCard({
  title,
  value,
  description,
  icon: Icon,
  tone = "neutral",
}: AnalyticsMetricCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-4 text-[32px] font-semibold tracking-[-0.04em]">{value}</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md",
            toneClasses[tone],
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}
