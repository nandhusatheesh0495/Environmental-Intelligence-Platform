"use client";

import * as React from "react";
import Link from "next/link";
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Activity,
  Layers,
  MapPin,
  CheckCircle2,
  FileCheck2,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/common/page-header";
import { SectionHeader } from "@/components/common/section-header";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { SummaryMetric } from "@/components/dashboard/summary-metric";
import { PriorityFindingCard } from "@/components/dashboard/priority-finding-card";
import { InvestigationsTable } from "@/components/dashboard/investigations-table";
import { MapPlaceholder } from "@/components/dashboard/map-placeholder";
import { RecentActivityList } from "@/components/dashboard/recent-activity-list";
import { EnvironmentSummary } from "@/components/dashboard/environment-summary";
import {
  fetchDashboardSummary,
  fetchRecentInvestigations,
  fetchPriorityFindings,
  fetchRecentActivity,
  type DataMode,
  type DemoEnvironment,
} from "@/services/dashboard";
import {
  DashboardSummary,
  InvestigationSummary,
  PriorityFinding,
  ActivityItem,
} from "@/domain/dashboard";

export default function OverviewPage() {
  const [dataMode, setDataMode] = React.useState<DataMode>("empty");
  const [demoEnvironment, setDemoEnvironment] = React.useState<DemoEnvironment>("all");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [investigations, setInvestigations] = React.useState<InvestigationSummary[]>([]);
  const [priorityFindings, setPriorityFindings] = React.useState<PriorityFinding[]>([]);
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);

  const loadData = React.useCallback(async (mode: DataMode, environment: DemoEnvironment = demoEnvironment) => {
    setIsLoading(true);
    setError(null);
    try {
      const [sum, inv, find, act] = await Promise.all([
        fetchDashboardSummary(mode, environment),
        fetchRecentInvestigations(mode, environment),
        fetchPriorityFindings(mode, environment),
        fetchRecentActivity(mode, environment),
      ]);
      setSummary(sum);
      setInvestigations(inv);
      setPriorityFindings(find);
      setActivities(act);
    } catch (err) {
      setError("Unable to retrieve operational dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData(dataMode, demoEnvironment);
  }, [dataMode, demoEnvironment, loadData]);

  const handleToggleMode = () => {
    const nextMode = dataMode === "empty" ? "demo" : "empty";
    setDataMode(nextMode);
    if (nextMode === "empty") {
      setDemoEnvironment("all");
    }
  };

  const handleDemoSelection = (environment: DemoEnvironment) => {
    setDemoEnvironment(environment);
    setDataMode("demo");
  };

  return (
    <div className="space-y-8">
      {/* Level 1: Page Title & Primary Operational CTA */}
      <PageHeader
        title="Environmental Overview"
        description="Monitor environmental change and prioritize areas requiring investigation."
        badge={
          dataMode === "demo" ? (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              Demo Fixture Mode
            </span>
          ) : (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Live Operational State
            </span>
          )
        }
        actions={
          <div className="flex items-center gap-2.5">
            {/* Fixture Mode Toggle (Ensures zero data fabrication) */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleMode}
              className="text-xs text-slate-600 gap-1.5 h-9"
              title="Toggle between real empty state and demonstration test fixtures"
              aria-label={dataMode === "demo" ? "View empty state" : "Preview demo fixtures"}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
              {dataMode === "demo" ? "View Empty State" : "Preview Demo Fixtures"}
            </Button>

            {/* Level 1 Primary Action */}
            <Link href="/new-analysis">
              <Button size="md" className="gap-2 shadow-sm font-semibold">
                <Compass className="h-4 w-4" />
                Start New Analysis
              </Button>
            </Link>
          </div>
        }
      />

      {/* Demonstration Fixtures Notice (Only shown in demo mode to prevent confusion) */}
      {dataMode === "demo" && (
        <div className="space-y-3">
          <Alert variant="warning" title="Demonstration Test Fixtures Active">
            The records below are synthetic test fixtures for UI verification and review workflow modeling.
            They do not represent real sensor measurements or confirmed hazards.
          </Alert>
          <div className="flex flex-wrap gap-2">
            {(["all", "river", "landslide"] as DemoEnvironment[]).map((environment) => (
              <Button
                key={environment}
                variant={demoEnvironment === environment ? "primary" : "outline"}
                size="sm"
                onClick={() => handleDemoSelection(environment)}
                className="text-xs capitalize"
              >
                {environment === "all" ? "All demo cases" : `${environment} demo`}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Global Error Boundary State */}
      {error && (
        <ErrorState
          title="Dashboard Service Unavailable"
          message={error}
          onRetry={() => loadData(dataMode)}
        />
      )}

      {/* Level 2: Areas Requiring Attention (High-Priority Findings) */}
      <section className="space-y-3" aria-labelledby="attention-heading">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="attention-heading" className="text-sm font-bold text-slate-900 tracking-tight">
              Areas Requiring Attention
            </h2>
            <p className="text-xs text-slate-500">
              High-priority change detections awaiting human officer verification.
            </p>
          </div>
          {priorityFindings.length > 0 && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
              {priorityFindings.length} Pending Review
            </span>
          )}
        </div>

        {priorityFindings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {priorityFindings.map((finding) => (
              <PriorityFindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center rounded-lg border border-dashed border-slate-200 bg-white shadow-xs">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <h4 className="text-xs font-bold text-slate-800">No findings requiring review</h4>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              When the analysis engine identifies a potential environmental change with high investigation priority, it will appear here for officer evaluation.
            </p>
          </div>
        )}
      </section>

      {/* Level 3: Summary Metrics */}
      <section className="space-y-3" aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">
          Operational Summary Metrics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <SummaryMetric
            label="Areas Monitored"
            value={summary?.areasMonitored}
            emptyLabel="No monitored areas"
            helperText="Designated jurisdictions"
            icon={MapPin}
          />
          <SummaryMetric
            label="Analyses"
            value={summary?.analysesCount}
            emptyLabel="No analyses yet"
            helperText="Comparative runs performed"
            icon={FileCheck2}
          />
          <SummaryMetric
            label="Changes Detected"
            value={summary?.changesDetected}
            emptyLabel="No active findings"
            helperText="Spectral change features"
            icon={Layers}
          />
          <SummaryMetric
            label="High Priority"
            value={summary?.highPriorityCount}
            emptyLabel="No immediate risks"
            helperText="Requires field inspection"
            icon={AlertTriangle}
            isAttentionRequired={true}
          />
        </div>
      </section>

      {/* Level 4: Recent Investigations */}
      <section className="space-y-3" aria-labelledby="investigations-heading">
        <SectionHeader
          title="Recent Investigations"
          description="Recent temporal analysis runs across monitored basins and slope sectors."
          action={
            <Link href="/new-analysis">
              <Button variant="ghost" size="sm" className="text-xs text-slate-600 gap-1">
                New Analysis
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          }
        />
        <InvestigationsTable investigations={investigations} />
      </section>

      {/* Level 5 & 6: Environmental Monitoring Map & Supported Environments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Environmental Monitoring Map Placeholder (2 cols) */}
        <section className="lg:col-span-2 space-y-3" aria-labelledby="monitoring-map-heading">
          <SectionHeader
            title="Environmental Monitoring Map"
            description="Geospatial distribution of active analyses, bounding polygons, and sensor coverage."
          />
          <MapPlaceholder
            hasMonitoredAreas={(summary?.areasMonitored ?? 0) > 0}
            monitoredAreasCount={summary?.areasMonitored ?? 0}
          />
        </section>

        {/* Level 7: Recent Activity (1 col) */}
        <section className="space-y-3" aria-labelledby="activity-heading">
          <SectionHeader
            title="Recent Activity"
            description="Operational audit log."
          />
          <RecentActivityList activities={activities} />
        </section>
      </div>

      {/* Level 6: Supported Environments Catalog Reference */}
      <section className="space-y-3 pt-2" aria-labelledby="environments-heading">
        <SectionHeader
          title="Monitoring Environments"
          description="Calibrated models decoupled from pixel processing infrastructure."
          action={
            <Link href="/environments">
              <Button variant="ghost" size="sm" className="text-xs text-slate-600 gap-1">
                View All Domain Specs
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          }
        />
        <EnvironmentSummary />
      </section>
    </div>
  );
}
