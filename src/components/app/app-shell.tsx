import { AppHeader } from "@/components/app/app-header";
import { AppSidebar } from "@/components/app/app-sidebar";
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">
        <AppSidebar user={user} />
        <div className="min-w-0 flex-1">
          <AppHeader user={user} themePreference={themePreference} />
          <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
