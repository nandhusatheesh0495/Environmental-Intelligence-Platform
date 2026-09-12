import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { REGISTERED_ENVIRONMENTS } from "@/domain/environments";
import { Waves, MountainSnow, ChevronRight, Layers, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface EnvironmentSummaryProps {
  className?: string;
}

export function EnvironmentSummary({ className }: EnvironmentSummaryProps) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-4", className)}>
      {REGISTERED_ENVIRONMENTS.map((env) => {
        const isPrimary = env.is_primary;
        const Icon = env.environment_id === "river" ? Waves : MountainSnow;

        return (
          <div
            key={env.environment_id}
            className={cn(
              "flex flex-col justify-between p-4 rounded-lg border bg-white shadow-xs transition-colors",
              isPrimary ? "border-accent-700/30 bg-accent-50/10" : "border-slate-200"
            )}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-7 w-7 rounded flex items-center justify-center shrink-0",
                      isPrimary ? "bg-accent-100 text-accent-800" : "bg-slate-100 text-slate-700"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 leading-tight">
                    {env.display_name}
                  </h4>
                </div>

                {isPrimary ? (
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-accent-100 text-accent-800 border border-accent-200">
                    Primary MVP
                  </span>
                ) : (
                  <span className="text-[10px] font-medium uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Secondary MVP
                  </span>
                )}
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {env.description}
              </p>

              <div className="flex items-center gap-2 text-[11px] text-slate-600 pt-1">
                <span className="font-semibold text-slate-800 font-mono">
                  {env.supported_problem_types.length}
                </span>
                <span>calibrated detection types</span>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
              <Link
                href={`/new-analysis?env=${env.environment_id}`}
                className="text-[11px] font-semibold text-accent-800 hover:text-accent-900 inline-flex items-center gap-1"
              >
                Analyze this domain
                <ChevronRight className="h-3 w-3" />
              </Link>

              <Link
                href="/environments"
                className="text-[11px] text-slate-400 hover:text-slate-600 inline-flex items-center gap-0.5"
              >
                Catalog specs
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
