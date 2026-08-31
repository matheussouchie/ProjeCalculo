import Image from "next/image";

import type { NavigationIconName } from "@/constants/navigation";
import { cn } from "@/lib/utils";

const iconSources: Record<NavigationIconName, { light: string; dark: string }> = {
  dashboard: {
    light: "/icons/figma/nav-dashboard-light.svg",
    dark: "/icons/figma/nav-dashboard-dark.svg",
  },
  calculator: {
    light: "/icons/figma/nav-calculator-light.svg",
    dark: "/icons/figma/nav-calculator-dark.svg",
  },
  rooms: {
    light: "/icons/figma/nav-rooms-light.svg",
    dark: "/icons/figma/nav-rooms-dark.svg",
  },
  projects: {
    light: "/icons/figma/nav-projects-light.svg",
    dark: "/icons/figma/nav-projects-dark.svg",
  },
  settings: {
    light: "/icons/figma/nav-settings-light.svg",
    dark: "/icons/figma/nav-settings-dark.svg",
  },
};

export function DesignIcon({
  name,
  className,
}: {
  name: NavigationIconName;
  className?: string;
}) {
  const source = iconSources[name];

  return (
    <span
      className={cn("relative block size-6 shrink-0", className)}
      aria-hidden="true"
    >
      <Image src={source.light} alt="" fill sizes="24px" className="dark:hidden" />
      <Image src={source.dark} alt="" fill sizes="24px" className="hidden dark:block" />
    </span>
  );
}
