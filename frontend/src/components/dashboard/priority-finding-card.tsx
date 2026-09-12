import * as React from "react";
import { cn } from "@/lib/utils";
import { PriorityFinding } from "@/domain/dashboard";
import { formatSeverity, formatInvestigationPriority, formatConfidence } from "@/domain/status";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Waves, MountainSnow, ShieldAlert, ArrowRight, UserCheck, Eye } from "lucide-react";

export interface PriorityFindingCardProps {
  finding: PriorityFinding;
  onReview?: (finding: PriorityFinding) => void;
  className?: string;
}

export function PriorityFindingCard({
  finding,
  onReview,
  className,
}: PriorityFindingCardProps) {
  const sevConfig = formatSeverity(finding.severity);
  const prioConfig = formatInvestigationPriority(
    finding.priority === "immediate" ? "critical" : finding.priority === "high" ? "high" : "medium"
  );
  const EnvIcon = finding.environmentId === "river" ? Waves : MountainSnow;

  return (
    <div
      className={cn(
        "flex flex-col justify-between p-5 rounded-lg border border-slate-200 bg-white shadow-xs hover:border-slate-300 transition-colors space-y-4",
        className
      )}
    >
      {/* Top Header: Problem Type & Priority Badges */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <EnvIcon className="h-3.5 w-3.5 text-slate-600" />
            <span>{finding.environmentName}</span>
            <span>•</span>
            <span className="font-mono text-[11px] text-slate-400">{finding.analysisId}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <StatusBadge label={prioConfig.label} variant={prioConfig.variant} />
            <StatusBadge label={sevConfig.label} variant={sevConfig.variant} />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug">
            {finding.problemType}
          </h4>
          <p className="text-xs font-medium text-slate-600 mt-0.5">
            {finding.areaName}
          </p>
        </div>
      </div>

      {/* AI Confidence & Scientific Disclaimer */}
      <div className="p-3 rounded-md bg-slate-50 border border-slate-100 space-y-1">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-900">
            {formatConfidence(finding.confidence)}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {Math.round(finding.confidence * 100)}/100 certainty
          </span>
        </div>
        {/* Progress bar representing confidence */}
        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-accent-700 h-1.5 rounded-full transition-all"
            style={{ width: `${Math.round(finding.confidence * 100)}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 pt-0.5 leading-tight">
          Confidence in the detected change classification. Does not represent disaster probability.
        </p>
      </div>

      {/* Recommendation and Officer Review Trigger */}
      <div className="pt-2 border-t border-slate-100 space-y-3">
        <div className="text-[11px] text-slate-600 leading-relaxed">
          <strong className="font-semibold text-slate-800">Action Protocol:</strong>{" "}
          {finding.recommendedAction}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
            Awaiting Human Officer Review
          </span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onReview?.(finding)}
            className="text-xs gap-1.5 h-8 border-slate-300"
          >
            <Eye className="h-3.5 w-3.5 text-slate-500" />
            Inspect Evidence
          </Button>
        </div>
      </div>
    </div>
  );
}
