import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface SummaryMetricProps {
  label: string;
  value: number | string | null | undefined;
  emptyLabel?: string;
  helperText?: string;
  icon?: LucideIcon;
  isAttentionRequired?: boolean;
  className?: string;
}

export function SummaryMetric({
  label,
  value,
  emptyLabel = "No active records",
  helperText,
  icon: Icon,
  isAttentionRequired = false,
  className,
}: SummaryMetricProps) {
  const hasValue = value !== null && value !== undefined && value !== 0 && value !== "0" && value !== "—";
  const displayValue = value === null || value === undefined ? "—" : value;

  return (
    <div
      className={cn(
        "flex flex-col justify-between p-5 rounded-lg border bg-white shadow-xs transition-colors",
        isAttentionRequired && hasValue
          ? "border-orange-300 bg-orange-50/20"
          : "border-slate-200 hover:border-slate-300",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {label}
        </span>
        {Icon && (
          <div
            className={cn(
              "h-7 w-7 rounded flex items-center justify-center shrink-0",
              isAttentionRequired && hasValue
                ? "bg-orange-100 text-orange-700"
                : "bg-slate-100 text-slate-600"
            )}
            aria-hidden="true"
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
          {displayValue}
        </div>
        <p className="text-xs text-slate-500 leading-normal">
          {!hasValue ? emptyLabel : helperText || "Monitored operational count"}
        </p>
      </div>
    </div>
  );
}
