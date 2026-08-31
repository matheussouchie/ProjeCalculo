import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-base font-semibold outline-none transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 focus-visible:ring-[3px] focus-visible:ring-ring/40 active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "border-[#a18ba8] bg-primary text-primary-foreground shadow-[var(--shadow-card)] hover:bg-[#e8a06d] dark:hover:bg-[#e5b08a]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[var(--shadow-card)] hover:bg-secondary/85",
        ghost: "text-foreground hover:bg-accent hover:text-accent-foreground",
        outline:
          "border-border bg-card text-foreground shadow-[var(--shadow-card)] hover:border-primary hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[var(--shadow-card)] hover:bg-destructive/85",
      },
      size: {
        default: "h-[46px] px-5 py-[11px]",
        sm: "h-10 px-4 text-sm",
        lg: "h-12 px-7 text-lg",
        icon: "size-11 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
