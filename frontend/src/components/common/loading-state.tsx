import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2, CheckCircle2 } from "lucide-react";

export interface LoadingStep {
  label: string;
  isComplete?: boolean;
  isActive?: boolean;
}

export interface LoadingStateProps {
  title?: string;
  message?: string;
  steps?: LoadingStep[];
  className?: string;
}

export function LoadingState({
  title = "Analyzing Environmental Area...",
  message = "Processing multitemporal raster imagery through change pipeline.",
  steps = [
    { label: "Preparing imagery & geospatial alignment", isComplete: true },
    { label: "Comparing pixel spectral variations", isActive: true },
    { label: "Detecting environmental change features", isComplete: false },
    { label: "Generating findings & human review evidence", isComplete: false },
  ],
  className,
}: LoadingStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 rounded-lg border border-slate-200 bg-white shadow-sm text-center max-w-lg mx-auto space-y-5",
        className
      )}
    >
      <div className="h-10 w-10 rounded-full bg-accent-50 text-accent-700 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500">{message}</p>
      </div>

      {steps && steps.length > 0 && (
        <div className="w-full space-y-2.5 pt-2 border-t border-slate-100 text-left">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-xs">
              {step.isComplete ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : step.isActive ? (
                <Loader2 className="h-4 w-4 text-accent-700 animate-spin shrink-0" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-slate-300 shrink-0" />
              )}
              <span
                className={cn(
                  "truncate",
                  step.isComplete && "text-slate-700 line-through opacity-80",
                  step.isActive && "text-accent-800 font-semibold",
                  !step.isComplete && !step.isActive && "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
