"use client";

import { useEffect, useTransition } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { updateThemePreferenceAction } from "@/app/actions/preferences";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ThemePreference } from "@/services/user-preferences/user-preferences.queries";

export function ThemeToggle({ initialTheme }: { initialTheme: ThemePreference }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme, setTheme]);

  function updateTheme(theme: ThemePreference) {
    setTheme(theme);
    startTransition(async () => {
      await updateThemePreferenceAction(theme);
    });
  }

  return (
    <div className="flex items-center gap-1 rounded-md border bg-card p-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(resolvedTheme === "light" && "bg-muted text-foreground")}
        onClick={() => updateTheme("light")}
        disabled={isPending}
        aria-label="Ativar tema claro"
        title="Tema claro"
      >
        <Sun aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(resolvedTheme === "dark" && "bg-muted text-foreground")}
        onClick={() => updateTheme("dark")}
        disabled={isPending}
        aria-label="Ativar tema escuro"
        title="Tema escuro"
      >
        <Moon aria-hidden="true" />
      </Button>
    </div>
  );
}
