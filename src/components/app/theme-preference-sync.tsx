"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

import type { ThemePreference } from "@/services/user-preferences/user-preferences.queries";

export function ThemePreferenceSync({
  initialTheme,
}: {
  initialTheme: ThemePreference;
}) {
  const { setTheme } = useTheme();

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");

    if (storedTheme !== "light" && storedTheme !== "dark") {
      setTheme(initialTheme);
    }
  }, [initialTheme, setTheme]);

  return null;
}
