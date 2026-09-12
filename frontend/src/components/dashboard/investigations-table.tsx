import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { InvestigationSummary } from "@/domain/dashboard";
import { formatAnalysisStatus, formatInvestigationPriority } from "@/domain/status";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/empty-state";
import { Compass, Waves, MountainSnow, ChevronRight, Clock } from "lucide-react";

export interface InvestigationsTableProps {
  investigations: InvestigationSummary[];
  onSelectInvestigation?: (investigation: InvestigationSummary) => void;
  className?: string;
}

export function InvestigationsTable({
  investigations,
  onSelectInvestigation,
  className,
}: InvestigationsTableProps) {
  if (!investigations || investigations.length === 0) {
    return (
      <EmptyState
        title="No investigations yet"
        description="Environmental analyses will appear here after you analyze a designated area."
        action={
          <Link href="/new-analysis">
            <Button size="sm" className="gap-1.5 mt-2">
              <Compass className="h-4 w-4" />
              Start New Analysis
            </Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className={cn("rounded-lg border border-slate-200 bg-white shadow-xs overflow-hidden", className)}>
      {/* Desktop Table View (Hidden on mobile) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px] tracking-wider">
            <tr>
              <th className="px-4 py-3">Area / Sector</th>
              <th className="px-4 py-3">Environment</th>
              <th className="px-4 py-3">Imagery Range</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Detections</th>
              <th className="px-4 py-3">Investigation Priority</th>
              <th className="px-4 py-3">Updated</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {investigations.map((item) => {
              const statusConfig = formatAnalysisStatus(item.status);
              const prioConfig = formatInvestigationPriority(
                item.highestPriority === "immediate"
                  ? "critical"
                  : item.highestPriority === "high"
                  ? "high"
                  : item.highestPriority === "moderate"
                  ? "medium"
                  : "low"
              );
              const EnvIcon = item.environmentId === "river" ? Waves : MountainSnow;

              return (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div>{item.areaName}</div>
                    <div className="font-mono text-[10px] text-slate-400">{item.id}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div className="inline-flex items-center gap-1.5">
                      <EnvIcon className="h-3.5 w-3.5 text-slate-500" />
                      <span>{item.environmentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    {item.dateRange}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge label={statusConfig.label} variant={statusConfig.variant} />
                  </td>
                  <td className="px-4 py-3 text-center font-mono font-medium text-slate-700">
                    {item.detectionsCount}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge
                      label={prioConfig.label.replace("Investigation Priority: ", "")}
                      variant={prioConfig.variant}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-[11px] whitespace-nowrap">
                    {item.lastUpdated}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/analysis/${item.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectInvestigation?.(item)}
                        className="h-7 text-xs text-slate-600 hover:text-slate-900 px-2"
                      >
                        View
                        <ChevronRight className="h-3 w-3 ml-0.5" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked Card View (Visible on mobile only) */}
      <div className="md:hidden divide-y divide-slate-100">
        {investigations.map((item) => {
          const statusConfig = formatAnalysisStatus(item.status);
          const prioConfig = formatInvestigationPriority(
            item.highestPriority === "immediate"
              ? "critical"
              : item.highestPriority === "high"
              ? "high"
              : item.highestPriority === "moderate"
              ? "medium"
              : "low"
          );
          const EnvIcon = item.environmentId === "river" ? Waves : MountainSnow;

          return (
            <div key={item.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{item.areaName}</h5>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                    <EnvIcon className="h-3 w-3" />
                    <span>{item.environmentName}</span>
                    <span>•</span>
                    <span className="font-mono">{item.id}</span>
                  </div>
                </div>
                <StatusBadge label={statusConfig.label} variant={statusConfig.variant} />
              </div>

              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100">
                <span>Range: {item.dateRange}</span>
                <span>Detections: <strong className="font-mono">{item.detectionsCount}</strong></span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <StatusBadge
                  label={prioConfig.label}
                  variant={prioConfig.variant}
                />
                <Link href={`/analysis/${item.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectInvestigation?.(item)}
                    className="h-7 text-xs"
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
