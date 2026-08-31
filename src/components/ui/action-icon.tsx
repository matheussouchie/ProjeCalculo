import Image from "next/image";

import { cn } from "@/lib/utils";

type ActionIconName = "edit" | "copy" | "delete";

const sources: Record<ActionIconName, string> = {
  edit: "/icons/figma/action-edit.svg",
  copy: "/icons/figma/action-copy.svg",
  delete: "/icons/figma/action-delete.svg",
};

export function ActionIcon({
  name,
  className,
}: {
  name: ActionIconName;
  className?: string;
}) {
  return (
    <span className={cn("relative block size-6", className)} aria-hidden="true">
      <Image src={sources[name]} alt="" fill sizes="24px" />
    </span>
  );
}
