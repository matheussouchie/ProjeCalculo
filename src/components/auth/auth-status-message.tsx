import { cn } from "@/lib/utils";

export function AuthStatusMessage({ ok, message }: { ok: boolean; message?: string }) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={cn(
        "rounded-sm border px-3 py-2 text-sm",
        ok
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
          : "border-destructive/25 bg-destructive/10 text-destructive",
      )}
    >
      {message}
    </p>
  );
}
