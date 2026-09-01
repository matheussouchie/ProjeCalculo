import { AppHeader } from "@/components/app/app-header";
import { AppSidebar } from "@/components/app/app-sidebar";
import { ThemePreferenceSync } from "@/components/app/theme-preference-sync";
import type { ThemePreference } from "@/services/user-preferences/user-preferences.queries";
import type { AppUser } from "@/types/auth";

export function AppShell({
  user,
  themePreference,
  children,
}: {
  user: AppUser;
  themePreference: ThemePreference;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <ThemePreferenceSync initialTheme={themePreference} />
      <div className="flex min-h-dvh w-full bg-background">
        <AppSidebar />
        <div className="min-w-0 flex-1 overflow-x-clip bg-white dark:bg-[#53575e]">
          <AppHeader user={user} themePreference={themePreference} />
          <main className="px-4 py-7 sm:px-7 lg:px-[clamp(32px,3.3vw,50px)] lg:py-10">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
