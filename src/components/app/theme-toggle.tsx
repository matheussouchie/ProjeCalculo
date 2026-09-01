"use client";

import { useTransition } from "react";
import { useTheme } from "next-themes";

import { updateThemePreferenceAction } from "@/app/actions/preferences";
import { Button } from "@/components/ui/button";
import type { ThemePreference } from "@/services/user-preferences/user-preferences.queries";

export function ThemeToggle({ initialTheme }: { initialTheme: ThemePreference }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [, startTransition] = useTransition();
  const isDark = (resolvedTheme ?? initialTheme) === "dark";

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
      className="relative overflow-hidden border border-[#a18ba8] bg-[#52395e] text-white shadow-none hover:border-[#53575e] hover:bg-[#c5b7c9] hover:text-[#53575e] active:border-[#a18ba8] active:bg-[#80658c] active:text-white dark:border-[#53575e] dark:bg-[#f0c4a3] dark:text-[#53575e] dark:hover:border-[#f5f1f7] dark:hover:bg-[#e8a06d] dark:hover:text-white dark:active:border-[#f5f1f7] dark:active:bg-[#de7c33] dark:active:text-white"
      onClick={toggleTheme}
      aria-label="Alternar tema"
      title="Alternar tema"
    >
      <span
        aria-hidden="true"
        className="size-6 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]"
        style={{
          WebkitMaskImage: "url(/icons/figma/theme-light.svg)",
          maskImage: "url(/icons/figma/theme-light.svg)",
        }}
      />
    </Button>
  );
}
