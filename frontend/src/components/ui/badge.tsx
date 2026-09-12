import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "accent";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "border-transparent bg-slate-100 text-slate-800",
    secondary: "border-transparent bg-slate-200 text-slate-900",
    outline: "text-slate-700 border-slate-300",
    accent: "border-transparent bg-accent-100 text-accent-800 border border-accent-200",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium border transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
