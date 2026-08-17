import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold tracking-[0.12em] uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        secondary: "border-blue-500/30 bg-blue-500/10 text-blue-300",
        destructive: "border-red-500/30 bg-red-500/10 text-red-300",
        warning: "border-amber-500/30 bg-amber-500/10 text-amber-200",
        outline: "border-white/10 bg-transparent text-slate-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
