/**
 * Status and Terminology formatting standards for the Environmental Intelligence Platform.
 * 
 * Enforces scientific caution and professional terminology across all UI elements:
 * - "Potential Riverbank Erosion" not "River is definitely eroding"
 * - "AI Confidence: 84%" not "84% disaster probability"
 * - "Change Severity: High"
 * - "Investigation Priority: High"
 * - "Recommended Action: Field Verification"
 */

import { SeverityLevel, AnalysisStatus, ReviewDecision } from "./types";

export interface StatusBadgeConfig {
  label: string;
  variant: "critical" | "high" | "medium" | "low" | "neutral" | "success" | "warning";
  dotColor: string;
}

export function formatSeverity(severity: SeverityLevel): StatusBadgeConfig {
  switch (severity) {
    case "critical":
      return {
        label: "Change Severity: Critical",
        variant: "critical",
        dotColor: "bg-red-500",
      };
    case "high":
      return {
        label: "Change Severity: High",
        variant: "high",
        dotColor: "bg-orange-500",
      };
    case "medium":
      return {
        label: "Change Severity: Medium",
        variant: "medium",
        dotColor: "bg-amber-500",
      };
    case "low":
    default:
      return {
        label: "Change Severity: Low",
        variant: "low",
        dotColor: "bg-sky-500",
      };
  }
}

export function formatInvestigationPriority(severity: SeverityLevel): StatusBadgeConfig {
  switch (severity) {
    case "critical":
      return {
        label: "Investigation Priority: Immediate",
        variant: "critical",
        dotColor: "bg-red-600",
      };
    case "high":
      return {
        label: "Investigation Priority: High",
        variant: "high",
        dotColor: "bg-orange-600",
      };
    case "medium":
      return {
        label: "Investigation Priority: Moderate",
        variant: "medium",
        dotColor: "bg-amber-600",
      };
    case "low":
    default:
      return {
        label: "Investigation Priority: Routine",
        variant: "low",
        dotColor: "bg-sky-600",
      };
  }
}

export function formatAnalysisStatus(status: AnalysisStatus): StatusBadgeConfig {
  switch (status) {
    case "completed":
      return {
        label: "Analysis Completed",
        variant: "success",
        dotColor: "bg-emerald-500",
      };
    case "reviewed":
      return {
        label: "Human Officer Reviewed",
        variant: "success",
        dotColor: "bg-teal-600",
      };
    case "processing":
      return {
        label: "AI Processing in Progress",
        variant: "warning",
        dotColor: "bg-amber-500",
      };
    case "validating":
      return {
        label: "Validating Imagery Inputs",
        variant: "warning",
        dotColor: "bg-amber-400",
      };
    case "ready":
      return {
        label: "Ready for Analysis",
        variant: "neutral",
        dotColor: "bg-slate-400",
      };
    case "failed":
      return {
        label: "Analysis Failed",
        variant: "critical",
        dotColor: "bg-red-500",
      };
    case "draft":
    default:
      return {
        label: "Draft",
        variant: "neutral",
        dotColor: "bg-slate-300",
      };
  }
}

export function formatReviewDecision(decision?: ReviewDecision): StatusBadgeConfig {
  switch (decision) {
    case "confirmed":
      return {
        label: "Confirmed by Officer",
        variant: "success",
        dotColor: "bg-emerald-600",
      };
    case "rejected":
      return {
        label: "Rejected by Officer",
        variant: "critical",
        dotColor: "bg-red-600",
      };
    case "inconclusive":
      return {
        label: "Inconclusive - Pending Field Check",
        variant: "warning",
        dotColor: "bg-amber-600",
      };
    default:
      return {
        label: "Awaiting Officer Review",
        variant: "neutral",
        dotColor: "bg-slate-400",
      };
  }
}

export function formatConfidence(confidence: number): string {
  const percentage = Math.round(confidence * 100);
  return `AI Confidence: ${percentage}%`;
}
