"use client";

import Image from "next/image";
import { useEffect, useTransition } from "react";
import { useTheme } from "next-themes";

import { updateThemePreferenceAction } from "@/app/actions/preferences";
import { Button } from "@/components/ui/button";
import type { ThemePreference } from "@/services/user-preferences/user-preferences.queries";

export function ThemeToggle({ initialTheme }: { initialTheme: ThemePreference }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [isPending, startTransition] = useTransition();
  const isDark = resolvedTheme === "dark";

  useEffect(() => {
    setTheme(initialTheme);
  }, [initialTheme, setTheme]);

  function toggleTheme() {
    const theme: ThemePreference = isDark ? "light" : "dark";
    setTheme(theme);
    startTransition(async () => {
      await updateThemePreferenceAction(theme);
    });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      className="relative overflow-hidden border border-[#a18ba8] bg-[#52395e] hover:bg-[#80658c] dark:border-[#53575e] dark:bg-[#f0c4a3] dark:hover:bg-[#e5b08a]"
      onClick={toggleTheme}
      disabled={isPending}
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema noturno"}
      title={isDark ? "Tema claro" : "Tema noturno"}
    >
      <Image
        src="/icons/figma/theme-light.svg"
        alt=""
        width={24}
        height={24}
        className="size-6 dark:hidden"
      />
      <Image
        src="/icons/figma/theme-dark.svg"
        alt=""
        width={24}
        height={24}
        className="hidden size-6 dark:block"
      />
    </Button>
  );
}
