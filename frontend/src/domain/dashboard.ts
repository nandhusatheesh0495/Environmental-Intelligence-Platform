/**
 * Domain types specifically for the Professional Dashboard.
 * 
 * Enforces strict scientific caution and separation of concerns:
 * - Change Severity: Magnitude of detected surface alteration (low, medium, high, critical)
 * - Investigation Priority: Urgency of human review required (routine, moderate, high, immediate)
 * - AI Confidence: Classifier certainty percentage, never disaster probability
 */

import { SeverityLevel, AnalysisStatus, ReviewDecision, EnvironmentType } from "./types";

export type InvestigationPriorityLevel = "routine" | "moderate" | "high" | "immediate";

export interface DashboardSummary {
  areasMonitored: number;
  analysesCount: number;
  changesDetected: number;
  highPriorityCount: number;
  lastUpdated: string;
}

export interface InvestigationSummary {
  id: string;
  areaName: string;
  environmentId: EnvironmentType;
  environmentName: string;
  dateRange: string;
  status: AnalysisStatus;
  detectionsCount: number;
  highestPriority: InvestigationPriorityLevel;
  lastUpdated: string;
}

export interface PriorityFinding {
  id: string;
  analysisId: string;
  problemType: string; // e.g. "Potential Riverbank Erosion"
  areaName: string;
  environmentId: EnvironmentType;
  environmentName: string;
  severity: SeverityLevel;
  priority: InvestigationPriorityLevel;
  confidence: number; // 0.0 to 1.0
  detectedAt: string;
  reviewStatus: ReviewDecision | "pending";
  recommendedAction: string;
}

export interface ActivityItem {
  id: string;
  type: "analysis_created" | "analysis_completed" | "change_detected" | "finding_reviewed" | "citizen_report_submitted";
  title: string;
  description: string;
  timestamp: string;
  environmentId?: EnvironmentType;
  entityId?: string;
}

export interface MonitoredAreaSummary {
  id: string;
  name: string;
  environmentId: EnvironmentType;
  environmentName: string;
  activeAnalysesCount: number;
  lastAnalysisDate?: string;
  status: "normal" | "attention_required" | "unmonitored";
}
