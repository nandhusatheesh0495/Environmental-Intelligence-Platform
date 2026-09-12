"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, AlertCircle, CheckCircle2, MapPin, CalendarDays, Image as ImageIcon, User, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";

const STATUS_OPTIONS = [
  { value: "under_review", label: "Mark Under Review" },
  { value: "reviewed", label: "Mark Reviewed" },
  { value: "resolved", label: "Mark Resolved" },
  { value: "rejected", label: "Reject" },
];

export default function CitizenReportDetailPage({ params }: { params: { reportId: string } }) {
  const [report, setReport] = React.useState<any>(null);
  const [status, setStatus] = React.useState<string>("new");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const loadReport = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/citizen-reports/${params.reportId}`);
      if (!response.ok) throw new Error("Report not found.");
      const data = await response.json();
      setReport(data);
      setStatus(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load report.");
    } finally {
      setIsLoading(false);
    }
  }, [params.reportId]);

  React.useEffect(() => { loadReport(); }, [loadReport]);

  const handleStatusChange = async (nextStatus: string) => {
    if (!report) return;
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/citizen-reports/${report.id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.detail || "Unable to update report status.");
      }
      const updated = await response.json();
      setReport(updated);
      setStatus(updated.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update report status.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-6 text-sm text-slate-600">Loading citizen report…</div>;
  }

  if (error || !report) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {error || "Citizen report not found."}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/citizen-reports">
          <Button variant="outline" size="sm" className="gap-2"><ArrowLeft className="h-3.5 w-3.5" /> Back to reports</Button>
        </Link>
      </div>

      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-700">Citizen Observation</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{report.id}</h1>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Status: {report.status}</span>
          <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Environment: {report.environment_type || "Unknown"}</span>
          <span className="rounded border border-slate-200 bg-slate-50 px-2 py-1">Submitted: {new Date(report.submitted_at || report.created_at).toLocaleDateString()}</span>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"><div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {error}</div></div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Report Information</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] uppercase tracking-wider text-slate-500">Location</span><p className="mt-2 font-medium text-slate-900">{report.location}</p></div>
              <div className="rounded border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] uppercase tracking-wider text-slate-500">Coordinates</span><p className="mt-2 font-medium text-slate-900">{report.latitude ?? "—"}, {report.longitude ?? "—"}</p></div>
              <div className="rounded border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] uppercase tracking-wider text-slate-500">Observation date</span><p className="mt-2 font-medium text-slate-900">{report.observation_date ? new Date(report.observation_date).toLocaleDateString() : "Not provided"}</p></div>
              <div className="rounded border border-slate-200 bg-slate-50 p-3"><span className="text-[10px] uppercase tracking-wider text-slate-500">Reporter</span><p className="mt-2 font-medium text-slate-900">{report.reporter_name || "Anonymous"}</p></div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Photo Evidence</h2>
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
              {report.image_path ? (
                <img src={`http://localhost:8000${report.image_path}`} alt="Citizen report evidence" className="h-80 w-full object-cover" />
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-slate-500">No uploaded photo available.</div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Observation</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{report.description}</p>
          </div>
        </div>

        <aside className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700"><ShieldAlert className="h-4 w-4" /> Officer review</div>
            <div className="mt-3">
              <Select
                label="Update status"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  handleStatusChange(e.target.value);
                }}
                options={STATUS_OPTIONS}
              />
              {saving && <p className="mt-2 text-xs text-slate-600">Saving status…</p>}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
            <p className="font-semibold text-slate-900">Important distinction</p>
            <p className="mt-2">This is a citizen observation, not an AI detection. It should be treated as evidence for human review and investigation.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
