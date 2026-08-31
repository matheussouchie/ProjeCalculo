"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AppLogo } from "@/components/app/app-logo";
import { DesignIcon } from "@/components/app/design-icon";
import { appNavigationItems } from "@/constants/navigation";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-screen w-[245px] shrink-0 bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <AppLogo className="h-[120px]" />

      <nav
        className="mt-3 flex flex-col gap-[15px] px-3"
        aria-label="Navegação principal"
      >
        {appNavigationItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex h-[54px] items-center gap-[10px] rounded-md px-5 text-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive &&
                  "bg-sidebar-accent text-sidebar-accent-foreground shadow-[var(--shadow-card)]",
              )}
            >
              <DesignIcon name={item.icon} />
              <span className="truncate">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
