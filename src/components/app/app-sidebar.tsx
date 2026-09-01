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
    <aside className="sticky top-0 hidden h-dvh w-[245px] shrink-0 bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <AppLogo className="h-[120px]" />

      <nav
        className="flex h-[326px] flex-col justify-center gap-[15px]"
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
                "mx-3 flex h-[54px] items-center gap-[10px] px-5 text-lg font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                "hover:text-[#e8a06d] active:text-[#de7c33] dark:hover:text-[#e5b08a] dark:active:text-[#de7c33]",
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
