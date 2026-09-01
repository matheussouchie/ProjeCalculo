import Image from "next/image";

import { cn } from "@/lib/utils";

type ActionIconName = "edit" | "copy" | "delete";

const states = ["default", "hover", "pressed"] as const;
const themes = ["light", "dark"] as const;

const stateClasses = {
  light: {
    default: "block group-hover:hidden group-active:hidden dark:hidden",
    hover: "hidden group-hover:block group-active:hidden dark:hidden",
    pressed: "hidden group-active:block dark:hidden",
  },
  dark: {
    default: "hidden dark:block dark:group-hover:hidden dark:group-active:hidden",
    hover: "hidden dark:group-hover:block dark:group-active:hidden",
    pressed: "hidden dark:group-active:block",
  },
} as const;

export function ActionIcon({
  name,
  className,
}: {
  name: ActionIconName;
  className?: string;
}) {
  return (
    <span className={cn("relative block size-6", className)} aria-hidden="true">
      {themes.flatMap((theme) =>
        states.map((state) => (
          <Image
            key={`${theme}-${state}`}
            src={`/icons/figma/action-${name}-${theme}-${state}.svg`}
            alt=""
            fill
            sizes="24px"
            className={stateClasses[theme][state]}
          />
        )),
      )}
    </span>
  );
}
