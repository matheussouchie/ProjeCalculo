import Image from "next/image";

import { cn } from "@/lib/utils";
import type { AppUser } from "@/types/auth";

export function UserAvatar({ user, className }: { user: AppUser; className?: string }) {
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={cn(
        "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border bg-muted text-xs font-semibold text-foreground",
        className,
      )}
    >
      {user.avatarUrl ? (
        <Image
          src={user.avatarUrl}
          alt={`Foto de ${user.name}`}
          fill
          sizes="64px"
          className="object-cover"
          unoptimized
        />
      ) : (
        initials || user.email[0]?.toUpperCase() || "U"
      )}
    </div>
  );
}
