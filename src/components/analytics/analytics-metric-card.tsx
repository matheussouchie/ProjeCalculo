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
  neutral: "bg-accent text-accent-foreground",
  success: "bg-success/20 text-foreground dark:text-card-foreground",
  warning: "bg-warning/20 text-foreground dark:text-card-foreground",
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
          <p className="mt-4 text-[30px] font-semibold tracking-normal">{value}</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        <div
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-md",
            toneClasses[tone],
          )}
        >
          <Icon className="size-4" aria-hidden="true" />
        </div>
      </CardContent>
    </Card>
  );
}
