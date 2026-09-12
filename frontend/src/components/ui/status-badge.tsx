import * as React from "react";
import { cn } from "@/lib/utils";

export interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  label: string;
  variant?: "critical" | "high" | "medium" | "low" | "neutral" | "success" | "warning";
  showDot?: boolean;
}

export function StatusBadge({
  label,
  variant = "neutral",
  showDot = true,
  className,
  ...props
}: StatusBadgeProps) {
  const variantStyles = {
    critical: "bg-red-50 text-red-800 border-red-200",
    high: "bg-orange-50 text-orange-800 border-orange-200",
    medium: "bg-amber-50 text-amber-800 border-amber-200",
    low: "bg-sky-50 text-sky-800 border-sky-200",
    success: "bg-emerald-50 text-emerald-800 border-emerald-200",
    warning: "bg-amber-50 text-amber-800 border-amber-200",
    neutral: "bg-slate-50 text-slate-700 border-slate-200",
  };

  const dotStyles = {
    critical: "bg-red-600",
    high: "bg-orange-600",
    medium: "bg-amber-500",
    low: "bg-sky-600",
    success: "bg-emerald-600",
    warning: "bg-amber-500",
    neutral: "bg-slate-400",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-xs font-medium tracking-tight select-none",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotStyles[variant])}
          aria-hidden="true"
        />
      )}
      {label}
    </span>
  );
}
