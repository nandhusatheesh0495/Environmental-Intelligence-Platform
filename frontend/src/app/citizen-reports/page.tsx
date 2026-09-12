"use client";

import * as React from "react";
import Link from "next/link";
import { Filter, Search, MapPin, User, ImageIcon, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const STATUSES = [
  { value: "all", label: "All" },
  { value: "new", label: "New" },
  { value: "under_review", label: "Under Review" },
  { value: "reviewed", label: "Reviewed" },
  { value: "resolved", label: "Resolved" },
  { value: "rejected", label: "Rejected" },
];

const ENVIRONMENTS = [
  { value: "all", label: "All" },
  { value: "river", label: "River" },
  { value: "landslide", label: "Landslide" },
  { value: "unknown", label: "Unknown" },
];

type CitizenReportRow = {
  id: string;
  environment_type: string;
  location: string;
  description: string;
  image_path?: string;
  status: string;
  submitted_at?: string;
  observation_date?: string;
  reporter_name?: string;
};

export default function CitizenReportsPage() {
  const [reports, setReports] = React.useState<CitizenReportRow[]>([]);
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [environmentFilter, setEnvironmentFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.set("status", statusFilter);
        if (environmentFilter !== "all") params.set("environment", environmentFilter);
        const response = await fetch(`http://localhost:8000/api/v1/citizen-reports?${params.toString()}`);
        if (!response.ok) throw new Error("Unable to load citizen reports.");
        const data = (await response.json()) as CitizenReportRow[];
        setReports(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load citizen reports.");
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, [statusFilter, environmentFilter]);

  const filteredReports = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return reports.filter((report) => {
      const matchesSearch = !term || [report.location, report.description, report.id].some((value) => value?.toLowerCase().includes(term));
      return matchesSearch;
    });
  }, [reports, search]);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-700">Officer Review</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Citizen Reports</h1>
        <p className="mt-2 text-sm text-slate-600">Environmental observations submitted by citizens for officer review and follow-up.</p>
      </header>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1.1fr_0.8fr_0.8fr]">
          <Input
            label="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, location, or description"
            aria-label="Search reports"
          />
          <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} options={STATUSES} />
          <Select label="Environment" value={environmentFilter} onChange={(e) => setEnvironmentFilter(e.target.value)} options={ENVIRONMENTS} />
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {error}</div>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">Loading citizen reports…</div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-600">
          <p className="font-semibold text-slate-800">No citizen reports yet</p>
          <p className="mt-2">Citizen observations submitted through the reporting workflow will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{report.id}</p>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-700">{report.environment_type || "Unknown"}</span>
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] uppercase tracking-wider text-amber-700">{report.status}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{report.location}</p>
                    <p className="mt-1 text-xs text-slate-500">Submitted {report.submitted_at ? new Date(report.submitted_at).toLocaleString() : "recently"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/citizen-reports/${report.id}`}>
                    <Button variant="outline" size="sm">Open report</Button>
                  </Link>
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
                <div className="rounded border border-slate-200 bg-slate-50 p-2"><span className="block text-[10px] uppercase tracking-wider text-slate-500">Observation date</span><span className="mt-1 block">{report.observation_date ? new Date(report.observation_date).toLocaleDateString() : "Not provided"}</span></div>
                <div className="rounded border border-slate-200 bg-slate-50 p-2"><span className="block text-[10px] uppercase tracking-wider text-slate-500">Reporter</span><span className="mt-1 block">{report.reporter_name || "Anonymous"}</span></div>
                <div className="rounded border border-slate-200 bg-slate-50 p-2"><span className="block text-[10px] uppercase tracking-wider text-slate-500">Summary</span><span className="mt-1 block line-clamp-2">{report.description}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
