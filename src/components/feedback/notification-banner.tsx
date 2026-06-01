import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";

import type { NotificationTone } from "@/constants/notifications";
import { cn } from "@/lib/utils";

type NotificationBannerProps = {
  tone: NotificationTone;
  message: string;
  actions?: React.ReactNode;
  className?: string;
};

const toneClasses = {
  success:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
  error: "border-destructive/25 bg-destructive/10 text-destructive",
  warning: "border-amber-500/25 bg-amber-500/10 text-amber-800 dark:text-amber-200",
  info: "border-blue-500/25 bg-blue-500/10 text-blue-800 dark:text-blue-200",
};

const toneIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info,
};

export function NotificationBanner({
  tone,
  message,
  actions,
  className,
}: NotificationBannerProps) {
  const Icon = toneIcons[tone];

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-md border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between",
        toneClasses[tone],
        className,
      )}
      role={tone === "error" ? "alert" : "status"}
    >
      <div className="flex items-center gap-2">
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span>{message}</span>
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}
