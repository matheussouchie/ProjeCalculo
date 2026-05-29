"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { AppLogo } from "@/components/app/app-logo";
import { UserAvatar } from "@/components/app/user-avatar";
import { Button } from "@/components/ui/button";
import { appNavigationItems, getNavigationTitle } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import type { AppUser } from "@/types/auth";

export function AppHeader({ user }: { user: AppUser }) {
  const pathname = usePathname();
  const title = getNavigationTitle(pathname);

  return (
    <header className="sticky top-0 z-20 border-b bg-background/85 backdrop-blur-xl">
      <div className="flex h-20 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Workspace
          </p>
          <h1 className="mt-1 truncate">{title}</h1>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="text-right">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <UserAvatar user={user} />
        </div>

        <details className="relative sm:hidden">
          <summary className="list-none">
            <Button variant="outline" size="icon" aria-label="Abrir menu">
              <Menu aria-hidden="true" />
            </Button>
          </summary>
          <div className="absolute right-0 mt-3 w-[min(320px,calc(100vw-32px))] rounded-lg border bg-card p-4 shadow-[var(--shadow-soft)]">
            <AppLogo />
            <nav className="mt-5 space-y-1">
              {appNavigationItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex h-11 items-center gap-3 rounded-sm px-3 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                      isActive && "bg-muted text-foreground",
                    )}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
        </details>
      </div>
    </header>
  );
}
