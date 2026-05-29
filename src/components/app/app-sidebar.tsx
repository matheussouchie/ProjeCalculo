"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";

import { signOutAction } from "@/app/actions/auth";
import { AppLogo } from "@/components/app/app-logo";
import { UserAvatar } from "@/components/app/user-avatar";
import { Button } from "@/components/ui/button";
import { appNavigationItems } from "@/constants/navigation";
import { cn } from "@/lib/utils";
import type { AppUser } from "@/types/auth";

export function AppSidebar({ user }: { user: AppUser }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-[280px] shrink-0 border-r bg-background/70 p-5 lg:flex lg:min-h-screen lg:flex-col">
      <AppLogo />

      <nav className="mt-10 space-y-1">
        {appNavigationItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex h-11 items-center gap-3 rounded-sm px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                isActive &&
                  "bg-card text-foreground shadow-[var(--shadow-card)] ring-1 ring-border",
              )}
            >
              <Icon className="size-4" aria-hidden="true" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-md border bg-card p-3 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <form action={signOutAction} className="mt-4">
          <Button variant="outline" className="w-full justify-start" size="sm">
            <LogOut aria-hidden="true" />
            Sair
          </Button>
        </form>
      </div>
    </aside>
  );
}
