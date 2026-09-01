import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent text-base font-semibold outline-none transition-colors duration-150 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-5 focus-visible:ring-[3px] focus-visible:ring-ring/40",
  {
    variants: {
      variant: {
        default:
          "border-[#a18ba8] bg-[#de7c33] text-[#f5f1f7] shadow-[var(--shadow-card)] hover:bg-[#f0c4a3] hover:text-[#53575e] active:bg-[#e8a06d] active:text-[#f5f1f7]",
        secondary:
          "bg-[#52395e] text-white shadow-[var(--shadow-card)] hover:bg-[#c5b7c9] hover:text-[#53575e] active:bg-[#80658c] active:text-[#f5f1f7] dark:bg-[#b0b4de] dark:text-[#52395e] dark:hover:bg-[#e5b08a] dark:hover:text-white dark:active:bg-[#de7c33] dark:active:text-white",
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
