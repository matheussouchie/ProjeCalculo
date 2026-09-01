import type { NavigationIconName } from "@/constants/navigation";
import { cn } from "@/lib/utils";

const iconSources: Record<NavigationIconName, string> = {
  dashboard: "/icons/figma/nav-dashboard-light.svg",
  calculator: "/icons/figma/nav-calculator-light.svg",
  rooms: "/icons/figma/nav-rooms-light.svg",
  projects: "/icons/figma/nav-projects-light.svg",
  settings: "/icons/figma/nav-settings-light.svg",
};

export function DesignIcon({
  name,
  className,
}: {
  name: NavigationIconName;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "block size-6 shrink-0 bg-current [mask-position:center] [mask-repeat:no-repeat] [mask-size:contain]",
        className,
      )}
      style={{
        WebkitMaskImage: `url(${iconSources[name]})`,
        maskImage: `url(${iconSources[name]})`,
      }}
      aria-hidden="true"
    />
  );
}
