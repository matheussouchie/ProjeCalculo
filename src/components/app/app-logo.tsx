import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        "flex w-full items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
      aria-label="Ir para o Dashboard do OnTime²"
    >
      <Image
        src="/branding/ontime-mark.png"
        alt="OnTime²"
        width={2000}
        height={2000}
        className="size-[92px] object-contain"
        priority
      />
    </Link>
  );
}
