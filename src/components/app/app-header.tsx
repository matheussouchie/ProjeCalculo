"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu } from "lucide-react";

import { signOutAction } from "@/app/actions/auth";
import { AppLogo } from "@/components/app/app-logo";
import { DesignIcon } from "@/components/app/design-icon";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { UserAvatar } from "@/components/app/user-avatar";
import { Button, buttonVariants } from "@/components/ui/button";
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
    <header className="sticky top-0 z-20 w-full bg-sidebar text-sidebar-foreground">
      <div className="flex h-[104px] w-full items-center gap-4 px-4 sm:px-7 lg:px-[clamp(24px,2.8vw,42px)] xl:gap-[25px]">
        <h1 className="min-w-0 flex-1 truncate text-2xl">{title}</h1>

        <div className="hidden shrink-0 items-center gap-4 md:flex xl:gap-[25px]">
          <ThemeToggle initialTheme={themePreference} />
          <div className="max-w-[260px] text-right xl:max-w-[302px]">
            <p className="truncate text-lg font-semibold leading-none">{user.name}</p>
            <p className="mt-1 truncate text-xs text-current">{user.email}</p>
          </div>
          <Link
            href="/configuracoes"
            aria-label="Abrir configurações do usuário"
            title="Configurações do usuário"
            className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
          >
            <UserAvatar
              user={user}
              className="size-16 border-[3px] border-[#a18ba8] transition-opacity hover:opacity-85"
            />
          </Link>
          <form action={signOutAction}>
            <Button variant="secondary">Sair</Button>
          </form>
        </div>

        <details className="group relative md:hidden">
          <summary
            aria-label="Abrir menu"
            className={cn(
              buttonVariants({ variant: "secondary", size: "icon" }),
              "cursor-pointer list-none",
            )}
          >
            <Menu aria-hidden="true" />
          </summary>
          <div className="absolute right-0 mt-3 w-[min(340px,calc(100vw-32px))] rounded-md border bg-card p-4 text-card-foreground shadow-[var(--shadow-soft)]">
            <AppLogo className="h-24" />
            <div className="mt-4 flex items-center justify-between gap-3 rounded-md bg-muted p-3">
              <Link
                href="/configuracoes"
                aria-label="Abrir configurações do usuário"
                title="Configurações do usuário"
                className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <UserAvatar user={user} className="size-12 border-2 border-[#a18ba8]" />
              </Link>
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
