/**
 * Dashboard Data Service.
 * 
 * Provides a clean boundary between UI components and backend data sources.
 * Supports realistic empty states (default) as well as explicitly marked demonstration fixtures.
 */

import {
  DashboardSummary,
  InvestigationSummary,
  PriorityFinding,
  ActivityItem,
  MonitoredAreaSummary,
} from "@/domain/dashboard";

export type DataMode = "empty" | "demo";
export type DemoEnvironment = "all" | "river" | "landslide";

export const EMPTY_SUMMARY: DashboardSummary = {
  areasMonitored: 0,
  analysesCount: 0,
  changesDetected: 0,
  highPriorityCount: 0,
  lastUpdated: new Date().toISOString(),
};

export const DEMO_SUMMARY: DashboardSummary = {
  areasMonitored: 4,
  analysesCount: 6,
  changesDetected: 9,
  highPriorityCount: 2,
  lastUpdated: "2026-09-12T23:11:58.616Z",
};

export const DEMO_PRIORITY_FINDINGS: PriorityFinding[] = [
  {
    id: "FND-2026-001",
    analysisId: "ANL-2026-089",
    problemType: "Potential Riverbank Erosion",
    areaName: "Periyar River - Lower Reach Sector 4",
    environmentId: "river",
    environmentName: "River Basin",
    severity: "high",
    priority: "high",
    confidence: 0.88,
    detectedAt: "2026-09-12T14:30:00Z",
    reviewStatus: "pending",
    recommendedAction: "Initiate field verification, evaluate embankment integrity, and alert water authority.",
  },
  {
    id: "FND-2026-002",
    analysisId: "ANL-2026-088",
    problemType: "Potential Landslide-related Change",
    areaName: "Wayanad Escarpment - Ridge Sector B",
    environmentId: "landslide",
    environmentName: "Landslide Risk Corridor",
    severity: "critical",
    priority: "immediate",
    confidence: 0.92,
    detectedAt: "2026-09-11T09:15:00Z",
    reviewStatus: "pending",
    recommendedAction: "Dispatch geological hazard assessment unit and inspect downslope transport corridors.",
  },
];

function filterDemoItems<T extends { environmentId?: string }>(items: T[], environment: DemoEnvironment): T[] {
  if (environment === "all") return items;
  return items.filter((item) => item.environmentId === environment);
}

export const DEMO_INVESTIGATIONS: InvestigationSummary[] = [
  {
    id: "ANL-2026-089",
    areaName: "Periyar River - Lower Reach Sector 4",
    environmentId: "river",
    environmentName: "River Basin",
    dateRange: "Aug 2026 → Sep 2026",
    status: "completed",
    detectionsCount: 3,
    highestPriority: "high",
    lastUpdated: "2 hours ago",
  },
  {
    id: "ANL-2026-088",
    areaName: "Wayanad Escarpment - Ridge Sector B",
    environmentId: "landslide",
    environmentName: "Landslide Risk Corridor",
    dateRange: "Jul 2026 → Sep 2026",
    status: "completed",
    detectionsCount: 4,
    highestPriority: "immediate",
    lastUpdated: "5 hours ago",
  },
  {
    id: "ANL-2026-087",
    areaName: "Meenachil Basin - Upstream Bend",
    environmentId: "river",
    environmentName: "River Basin",
    dateRange: "May 2026 → Aug 2026",
    status: "processing",
    detectionsCount: 1,
    highestPriority: "moderate",
    lastUpdated: "1 day ago",
  },
  {
    id: "ANL-2026-086",
    areaName: "Bharathapuzha - Palakkad Reach",
    environmentId: "river",
    environmentName: "River Basin",
    dateRange: "Jan 2026 → Jun 2026",
    status: "reviewed",
    detectionsCount: 1,
    highestPriority: "routine",
    lastUpdated: "3 days ago",
  },
];

export const DEMO_ACTIVITIES: ActivityItem[] = [
  {
    id: "ACT-001",
    type: "change_detected",
    title: "Potential Riverbank Erosion identified",
    description: "Periyar River Lower Reach Sector 4 — AI Confidence: 88%",
    timestamp: "2 hours ago",
    environmentId: "river",
    entityId: "ANL-2026-089",
  },
  {
    id: "ACT-002",
    type: "analysis_completed",
    title: "Comparative analysis completed",
    description: "Wayanad Escarpment Ridge Sector B processed across 2 timestamps",
    timestamp: "5 hours ago",
    environmentId: "landslide",
    entityId: "ANL-2026-088",
  },
  {
    id: "ACT-003",
    type: "finding_reviewed",
    title: "Finding reviewed and confirmed by Officer",
    description: "Bharathapuzha Reach morphology confirmed following field visit",
    timestamp: "3 days ago",
    environmentId: "river",
    entityId: "ANL-2026-086",
  },
];

export async function fetchDashboardSummary(
  mode: DataMode = "empty",
  environment: DemoEnvironment = "all",
): Promise<DashboardSummary> {
  if (mode === "demo") {
    const filtered = filterDemoItems(DEMO_PRIORITY_FINDINGS, environment);
    const analyses = filterDemoItems(DEMO_INVESTIGATIONS, environment);
    return {
      areasMonitored: environment === "all" ? DEMO_SUMMARY.areasMonitored : Math.max(1, filtered.length),
      analysesCount: environment === "all" ? DEMO_SUMMARY.analysesCount : analyses.length,
      changesDetected: environment === "all" ? DEMO_SUMMARY.changesDetected : filtered.length,
      highPriorityCount: environment === "all" ? DEMO_SUMMARY.highPriorityCount : filtered.filter((item) => item.priority === "high").length,
      lastUpdated: DEMO_SUMMARY.lastUpdated,
    };
  }
  return EMPTY_SUMMARY;
}

export async function fetchRecentInvestigations(
  mode: DataMode = "empty",
  environment: DemoEnvironment = "all",
): Promise<InvestigationSummary[]> {
  if (mode === "demo") {
    return filterDemoItems(DEMO_INVESTIGATIONS, environment);
  }
  return [];
}

export async function fetchPriorityFindings(
  mode: DataMode = "empty",
  environment: DemoEnvironment = "all",
): Promise<PriorityFinding[]> {
  if (mode === "demo") {
    return filterDemoItems(DEMO_PRIORITY_FINDINGS, environment);
  }
  return [];
}

export async function fetchRecentActivity(
  mode: DataMode = "empty",
  environment: DemoEnvironment = "all",
): Promise<ActivityItem[]> {
  if (mode === "demo") {
    return filterDemoItems(DEMO_ACTIVITIES, environment);
  }
  return [];
}
