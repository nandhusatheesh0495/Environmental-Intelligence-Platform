import * as React from "react";
import { cn } from "@/lib/utils";
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "warning" | "error" | "success";
  title?: string;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  ...props
}: AlertProps) {
  const variantStyles = {
    info: "border-sky-200 bg-sky-50/80 text-sky-900",
    warning: "border-amber-200 bg-amber-50/80 text-amber-900",
    error: "border-red-200 bg-red-50/80 text-red-900",
    success: "border-emerald-200 bg-emerald-50/80 text-emerald-900",
  };

  const Icon = {
    info: Info,
    warning: AlertTriangle,
    error: AlertCircle,
    success: CheckCircle2,
  }[variant];

  const iconColors = {
    info: "text-sky-600",
    warning: "text-amber-600",
    error: "text-red-600",
    success: "text-emerald-600",
  }[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-lg border p-4 text-xs leading-relaxed",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <Icon className={cn("h-4 w-4 shrink-0 mt-0.5", iconColors)} aria-hidden="true" />
      <div className="flex-1 space-y-1">
        {title && <h5 className="font-semibold text-sm leading-none">{title}</h5>}
        <div className="opacity-90">{children}</div>
      </div>
    </div>
  );
}
