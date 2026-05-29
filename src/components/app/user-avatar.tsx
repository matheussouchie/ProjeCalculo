import type { AppUser } from "@/types/auth";

export function UserAvatar({ user }: { user: AppUser }) {
  const initials = user.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex size-10 items-center justify-center rounded-full border bg-muted text-xs font-semibold text-foreground">
      {initials || user.email[0]?.toUpperCase() || "U"}
    </div>
  );
}
