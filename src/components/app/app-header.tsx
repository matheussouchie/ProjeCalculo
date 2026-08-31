"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";

import { signOutAction } from "@/app/actions/auth";
import { AppLogo } from "@/components/app/app-logo";
import { DesignIcon } from "@/components/app/design-icon";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { UserAvatar } from "@/components/app/user-avatar";
import { Button } from "@/components/ui/button";
import { appNavigationItems, getNavigationTitle } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import type { ThemePreference } from "@/services/user-preferences/user-preferences.queries";
import type { AppUser } from "@/types/auth";

export function AppHeader({
  user,
  themePreference,
}: {
  user: AppUser;
  themePreference: ThemePreference;
}) {
  const pathname = usePathname();
  const title = getNavigationTitle(pathname);

  return (
    <header className="sticky top-0 z-20 bg-sidebar text-sidebar-foreground shadow-[var(--shadow-card)]">
      <div className="flex h-[104px] items-center justify-between gap-5 px-4 sm:px-7 lg:px-[42px]">
        <h1 className="truncate">{title}</h1>

        <div className="hidden items-center gap-5 sm:flex">
          <ThemeToggle initialTheme={themePreference} />
          <div className="max-w-[260px] text-right">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground dark:text-[#dddade]">
              {user.email}
            </p>
          </div>
          <UserAvatar user={user} />
          <form action={signOutAction}>
            <Button variant="secondary">Sair</Button>
          </form>
        </div>

        <details className="group relative sm:hidden">
          <summary className="list-none">
            <Button variant="secondary" size="icon" aria-label="Abrir menu">
              <Menu aria-hidden="true" />
            </Button>
          </summary>
          <div className="absolute right-0 mt-3 w-[min(340px,calc(100vw-32px))] rounded-md border bg-card p-4 text-card-foreground shadow-[var(--shadow-soft)]">
            <AppLogo className="h-24" />
            <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-muted p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <ThemeToggle initialTheme={themePreference} />
            </div>
            <nav className="mt-5 flex flex-col gap-2" aria-label="Navegação móvel">
              {appNavigationItems.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "flex h-12 items-center gap-3 rounded-md px-4 font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                      isActive && "bg-accent text-accent-foreground",
                    )}
                  >
                    <DesignIcon name={item.icon} />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
            <form action={signOutAction} className="mt-4">
              <Button variant="secondary" className="w-full">
                <LogOut aria-hidden="true" />
                Sair
              </Button>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}
