import * as React from "react";
import { cn } from "@/lib/utils";

export interface DataRowProps {
  label: string;
  value: React.ReactNode;
  isMono?: boolean;
  className?: string;
}

export function DataRow({ label, value, isMono = false, className }: DataRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0 text-xs",
        className
      )}
    >
      <span className="text-slate-500 font-medium">{label}</span>
      <span
        className={cn(
          "text-slate-900 font-semibold text-right",
          isMono && "font-mono text-[11px]"
        )}
      >
        {value}
      </span>
    </div>
  );
}
