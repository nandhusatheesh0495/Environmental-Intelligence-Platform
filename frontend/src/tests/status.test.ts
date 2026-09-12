import { describe, it, expect } from "vitest";
import {
  formatConfidence,
  formatSeverity,
  formatInvestigationPriority,
  formatAnalysisStatus,
  formatReviewDecision,
} from "@/domain/status";

describe("Status and Terminology Formatting", () => {
  it("formats AI confidence as classifier certainty percentage", () => {
    expect(formatConfidence(0.875)).toBe("AI Confidence: 88%");
    expect(formatConfidence(0.5)).toBe("AI Confidence: 50%");
    expect(formatConfidence(0.999)).toBe("AI Confidence: 100%");
    // Verify it doesn't say "disaster probability"
    expect(formatConfidence(0.85)).not.toContain("disaster");
  });

  it("formats severity with cautious, professional status badges", () => {
    const critical = formatSeverity("critical");
    expect(critical.label).toBe("Change Severity: Critical");
    expect(critical.variant).toBe("critical");

    const high = formatSeverity("high");
    expect(high.label).toBe("Change Severity: High");
    expect(high.variant).toBe("high");

    const medium = formatSeverity("medium");
    expect(medium.label).toBe("Change Severity: Medium");
    expect(medium.variant).toBe("medium");

    const low = formatSeverity("low");
    expect(low.label).toBe("Change Severity: Low");
    expect(low.variant).toBe("low");
  });

  it("formats investigation priority appropriately", () => {
    expect(formatInvestigationPriority("critical").label).toBe("Investigation Priority: Immediate");
    expect(formatInvestigationPriority("high").label).toBe("Investigation Priority: High");
    expect(formatInvestigationPriority("medium").label).toBe("Investigation Priority: Moderate");
    expect(formatInvestigationPriority("low").label).toBe("Investigation Priority: Routine");
  });

  it("formats human-in-the-loop review decisions", () => {
    expect(formatReviewDecision("confirmed").label).toBe("Confirmed by Officer");
    expect(formatReviewDecision("rejected").label).toBe("Rejected by Officer");
    expect(formatReviewDecision("inconclusive").label).toBe("Inconclusive - Pending Field Check");
    expect(formatReviewDecision(undefined).label).toBe("Awaiting Officer Review");
  });

  it("formats analysis lifecycle statuses", () => {
    expect(formatAnalysisStatus("draft").label).toBe("Draft");
    expect(formatAnalysisStatus("validating").label).toBe("Validating Imagery Inputs");
    expect(formatAnalysisStatus("processing").label).toBe("AI Processing in Progress");
    expect(formatAnalysisStatus("completed").label).toBe("Analysis Completed");
    expect(formatAnalysisStatus("reviewed").label).toBe("Human Officer Reviewed");
  });
});
