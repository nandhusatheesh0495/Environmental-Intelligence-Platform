import * as React from "react";
import { ChevronDown, ChevronUp, ShieldAlert, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

export interface DetectionCardProps {
  problemType: string;
  confidence: number;
  confidenceLabel: string;
  priority: string;
  evidenceCount: number;
  explanation: string;
  recommendation: string;
  evidence: string[];
  className?: string;
}

export function DetectionCard({
  problemType,
  confidence,
  confidenceLabel,
  priority,
  evidenceCount,
  explanation,
  recommendation,
  evidence,
  className,
}: DetectionCardProps) {
  const [expanded, setExpanded] = React.useState(false);
  const percentage = Math.round(confidence * 100);

  const priorityVariant =
    priority.toLowerCase().includes("high")
      ? "high"
      : priority.toLowerCase().includes("moderate")
        ? "medium"
        : priority.toLowerCase().includes("low")
          ? "low"
          : "neutral";

  return (
    <div className={cn("rounded-xl border border-slate-200 bg-white p-4 shadow-sm", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-700" aria-hidden="true" />
            <h3 className="text-base font-semibold text-slate-900">{problemType}</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">{percentage}%</span>
            <span>·</span>
            <span>{confidenceLabel}</span>
          </div>
        </div>

        <StatusBadge label={priority} variant={priorityVariant} />
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Confidence</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">{percentage}%</p>
          <p className="mt-1 text-xs text-slate-600">AI confidence reflects classification evidence and observed visual change, not a prediction of final impact.</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Investigation Priority</p>
          <p className="mt-2 text-lg font-semibold capitalize text-slate-900">{priority}</p>
          <p className="mt-1 text-xs text-slate-600">{evidenceCount} evidence points</p>
        </div>
      </div>

      <div className="mt-4 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-700" aria-hidden="true" />
          Why this was identified
        </div>
        <p className="text-sm text-slate-700">{explanation}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-sm font-medium text-slate-800">Recommended action</div>
        <button
          type="button"
          aria-expanded={expanded}
          aria-label={expanded ? "Hide evidence" : "View evidence"}
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex items-center gap-1 rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300"
        >
          {expanded ? "Hide evidence" : "View evidence"}
          {expanded ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
        </button>
      </div>

      <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700">
        <p className="font-medium text-slate-900">Recommended action</p>
        <p className="mt-1">{recommendation}</p>
      </div>

      {expanded && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Evidence</p>
          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
            {evidence.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
