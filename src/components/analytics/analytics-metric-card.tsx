import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type AnalyticsMetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon?: LucideIcon;
  tone?: "neutral" | "success" | "warning";
  appearance?: "default" | "dashboard";
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
  appearance = "default",
}: AnalyticsMetricCardProps) {
  if (appearance === "dashboard") {
    return (
      <Card className="h-[205px] justify-center gap-0 overflow-hidden border-[3px] border-[#c5b7c9] bg-card px-[clamp(22px,2.5vw,38px)] py-[25px] text-foreground shadow-[var(--shadow-soft)] dark:border-[#f5f1f7]">
        <CardContent className="flex flex-col justify-center gap-[10px] p-0">
          <p className="text-base font-normal leading-none">{title}</p>
          <p className="text-[30px] font-semibold leading-none tracking-normal">
            {value}
          </p>
          <p className="text-base leading-tight text-foreground/50">{description}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex items-start justify-between gap-4 p-6">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-4 text-[30px] font-semibold tracking-normal">{value}</p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex size-12 shrink-0 items-center justify-center rounded-md",
              toneClasses[tone],
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
