"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, FileText, MapPin, ShieldCheck, Sparkles, UserCheck, XCircle, AlertTriangle, CalendarRange } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const REVIEW_DECISIONS = [
  { value: "confirmed", label: "Confirm Finding" },
  { value: "rejected", label: "Reject Finding" },
  { value: "inconclusive", label: "Mark Inconclusive" },
] as const;

type ReviewDecision = (typeof REVIEW_DECISIONS)[number]["value"];

type AnalysisRecord = {
  id: string;
  area_name: string;
  location: string;
  environment_type: string;
  environment_name: string;
  analysis_status: string;
  before_image: { date: string; source: string; url?: string };
  after_image: { date: string; source: string; url?: string };
  analysis_date: string;
  imagery_source: string;
  detections: Array<{
    id: string;
    problem_type: string;
    severity: string;
    confidence: number;
    confidence_label: string;
    investigation_priority: string;
    change_percentage?: number;
    evidence_summary: string;
    explanation: string;
    recommendation: string;
    evidence: string[];
    review_status: "pending" | "confirmed" | "rejected" | "inconclusive";
    review_comment?: string;
    reviewer_id?: string;
  }>;
  quality_notes?: string[];
};

const emptyAnalysis: AnalysisRecord = {
  id: "",
  area_name: "Location not available",
  location: "Location not available",
  environment_type: "river",
  environment_name: "River Basin",
  analysis_status: "completed",
  before_image: { date: "N/A", source: "N/A" },
  after_image: { date: "N/A", source: "N/A" },
  analysis_date: "N/A",
  imagery_source: "Unavailable",
  detections: [],
  quality_notes: [],
};

function formatDate(value?: string) {
  if (!value || value === "N/A") return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatPriority(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function getPriorityClasses(priority: string) {
  switch (priority.toLowerCase()) {
    case "high":
      return "border-red-200 bg-red-50 text-red-700";
    case "moderate":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
}

export default function AnalysisDetailPage({ params }: { params: { analysisId: string } }) {
  const [analysis, setAnalysis] = React.useState<AnalysisRecord>(emptyAnalysis);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [reportStatus, setReportStatus] = React.useState<"idle" | "preparing" | "ready" | "error">("idle");
  const [reportPayload, setReportPayload] = React.useState<any>(null);
  const [commentText, setCommentText] = React.useState("");
  const [reviewingId, setReviewingId] = React.useState<string | null>(null);
  const [reviewError, setReviewError] = React.useState<string | null>(null);
  const [selectedDetectionId, setSelectedDetectionId] = React.useState<string | null>(null);

  const loadAnalysis = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/analysis/${params.analysisId}`);
      if (!response.ok) {
        throw new Error("Analysis not found.");
      }
      const data = (await response.json()) as AnalysisRecord;
      setAnalysis(data);
      setSelectedDetectionId(data.detections[0]?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load analysis details.");
      setAnalysis(emptyAnalysis);
    } finally {
      setIsLoading(false);
    }
  }, [params.analysisId]);

  React.useEffect(() => {
    loadAnalysis();
  }, [loadAnalysis]);

  const selectedDetection = React.useMemo(
    () => analysis.detections.find((d) => d.id === selectedDetectionId) ?? analysis.detections[0] ?? null,
    [analysis.detections, selectedDetectionId]
  );

  const handleReviewSubmit = async (decision: ReviewDecision) => {
    if (!selectedDetection) return;
    setReviewingId(selectedDetection.id);
    setReviewError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/analysis/${params.analysisId}/detections/${selectedDetection.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, comment: commentText.trim() }),
      });
      if (!response.ok) {
        throw new Error("Unable to save review.");
      }
      await loadAnalysis();
      setCommentText("");
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Unable to save review.");
    } finally {
      setReviewingId(null);
    }
  };

  const handleGenerateReport = async () => {
    setReportStatus("preparing");
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/analysis/${params.analysisId}/report`, { method: "POST" });
      if (!response.ok) {
        throw new Error("Unable to generate report.");
      }
      const data = await response.json();
      setReportPayload(data);
      setReportStatus("ready");
    } catch (err) {
      setReportStatus("error");
      setError(err instanceof Error ? err.message : "Unable to generate report.");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading area report…</div>
      </div>
    );
  }

  if (error && !analysis.id) {
    return (
      <div className="space-y-4 p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900">
          <p className="font-semibold">Analysis not found.</p>
          <p className="mt-2 text-sm">The requested analysis is unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/monitoring-map">
            <Button variant="outline" size="sm" className="gap-2 text-xs">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to map
            </Button>
          </Link>
        </div>
        <Button variant="primary" size="sm" className="gap-2" onClick={handleGenerateReport} disabled={reportStatus === "preparing"}>
          <FileText className="h-3.5 w-3.5" />
          {reportStatus === "preparing" ? "Preparing report..." : "Generate Report"}
        </Button>
      </div>

      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-700">Area Report</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{analysis.area_name}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1"><MapPin className="h-3.5 w-3.5" />{analysis.location}</span>
          <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1"><ShieldCheck className="h-3.5 w-3.5" />{analysis.environment_name}</span>
          <span className="inline-flex items-center gap-1 rounded border border-slate-200 bg-slate-50 px-2 py-1"><CalendarRange className="h-3.5 w-3.5" />{formatDate(analysis.analysis_date)}</span>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{error}</div>
        </div>
      )}

      {reportStatus === "ready" && reportPayload && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4" /> Report ready</div>
          <p className="mt-2">{reportPayload.report.area_name} — {reportPayload.report.review_summary}</p>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Summary</CardTitle>
              <CardDescription>Evidence-focused summary of the monitored area and analysis timeline.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Area / Location</p><p className="mt-2 font-semibold text-slate-900">{analysis.area_name}</p><p className="text-sm text-slate-600">{analysis.location}</p></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Environment</p><p className="mt-2 font-semibold text-slate-900">{analysis.environment_name}</p></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Analysis Status</p><p className="mt-2 font-semibold text-slate-900">{analysis.analysis_status}</p></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Analysis Date</p><p className="mt-2 font-semibold text-slate-900">{formatDate(analysis.analysis_date)}</p></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">Before Date</p><p className="mt-2 font-semibold text-slate-900">{formatDate(analysis.before_image.date)}</p></div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] uppercase tracking-wider text-slate-500">After Date</p><p className="mt-2 font-semibold text-slate-900">{formatDate(analysis.after_image.date)}</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Before / After Evidence</CardTitle>
              <CardDescription>Images used to support the change comparison.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Before</p>
                <div className="mt-3 overflow-hidden rounded border border-slate-200 bg-white">
                  {analysis.before_image.url ? <img src={analysis.before_image.url} alt="Before image" className="h-52 w-full object-cover" /> : <div className="flex h-52 items-center justify-center text-sm text-slate-500">Before image unavailable</div>}
                </div>
                <p className="mt-2 text-sm text-slate-600">{formatDate(analysis.before_image.date)} · {analysis.before_image.source}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">After</p>
                <div className="mt-3 overflow-hidden rounded border border-slate-200 bg-white">
                  {analysis.after_image.url ? <img src={analysis.after_image.url} alt="After image" className="h-52 w-full object-cover" /> : <div className="flex h-52 items-center justify-center text-sm text-slate-500">After image unavailable</div>}
                </div>
                <p className="mt-2 text-sm text-slate-600">{formatDate(analysis.after_image.date)} · {analysis.after_image.source}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Detected Changes</CardTitle>
              <CardDescription>Phase 4 visual change evidence and Phase 5 interpretation output.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {analysis.detections.length === 0 ? (
                <p className="text-sm text-slate-600">No potential environmental problems were identified by this analysis.</p>
              ) : (
                analysis.detections.map((detection) => (
                  <button
                    key={detection.id}
                    type="button"
                    onClick={() => setSelectedDetectionId(detection.id)}
                    className={`w-full rounded-lg border p-4 text-left transition ${selectedDetection?.id === detection.id ? "border-accent-700 bg-accent-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{detection.problem_type}</p>
                        <p className="mt-1 text-xs text-slate-500">{detection.evidence_summary}</p>
                      </div>
                      <span className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${getPriorityClasses(detection.investigation_priority)}`}>
                        {formatPriority(detection.investigation_priority)} Priority
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                      <span className="rounded bg-white px-2 py-1">AI Confidence {Math.round((detection.confidence ?? 0) * 100)}%</span>
                      <span className="rounded bg-white px-2 py-1">Review: {detection.review_status}</span>
                    </div>
                  </button>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          {selectedDetection && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedDetection.problem_type}</CardTitle>
                <CardDescription>Human review and evidence detail</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">AI Confidence</p>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700">{selectedDetection.confidence_label}</span>
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-slate-900">{Math.round((selectedDetection.confidence ?? 0) * 100)}%</p>
                  <p className="mt-1 text-xs text-slate-600">AI confidence reflects classification certainty, not disaster probability.</p>
                </div>

                <div className="space-y-2 text-sm text-slate-700">
                  <div className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2"><span>Investigation priority</span><span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${getPriorityClasses(selectedDetection.investigation_priority)}`}>{formatPriority(selectedDetection.investigation_priority)}</span></div>
                  <div className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2"><span>Change severity</span><span className="font-semibold">{selectedDetection.severity}</span></div>
                  <div className="flex items-center justify-between rounded border border-slate-200 bg-white px-3 py-2"><span>Changed area</span><span className="font-semibold">{selectedDetection.change_percentage ?? "—"}%</span></div>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Evidence</p>
                  <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
                    {(selectedDetection.evidence ?? [selectedDetection.evidence_summary]).map((item) => <li key={item}>{item}</li>)}
                  </ul>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Recommendation</p>
                  <p className="mt-2 text-sm text-slate-700">{selectedDetection.recommendation}</p>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Human Review</p>
                  <p className="mt-2 text-sm text-slate-700">Current decision: <span className="font-semibold">{selectedDetection.review_status || "pending"}</span></p>
                  <textarea value={commentText} onChange={(event) => setCommentText(event.target.value)} placeholder="Optional field note for the review record..." className="mt-3 min-h-24 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-accent-700" />
                  <div className="mt-3 grid gap-2">
                    {REVIEW_DECISIONS.map((decision) => (
                      <Button
                        key={decision.value}
                        variant={decision.value === "rejected" ? "destructive" : "secondary"}
                        size="sm"
                        className="justify-center"
                        disabled={reviewingId === selectedDetection.id}
                        onClick={() => handleReviewSubmit(decision.value)}
                      >
                        {reviewingId === selectedDetection.id ? "Saving review..." : decision.label}
                      </Button>
                    ))}
                  </div>
                  {reviewError && <p className="mt-2 text-xs text-red-700">{reviewError}</p>}
                </div>
              </CardContent>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
