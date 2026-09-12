import { describe, it, expect } from "vitest";
import {
  fetchDashboardSummary,
  fetchRecentInvestigations,
  fetchPriorityFindings,
  fetchRecentActivity,
  EMPTY_SUMMARY,
  DEMO_SUMMARY,
  DEMO_PRIORITY_FINDINGS,
} from "@/services/dashboard";

describe("Dashboard Data Service", () => {
  describe("fetchDashboardSummary", () => {
    it("returns zero counts in default empty mode without fabricating live data", async () => {
      const summary = await fetchDashboardSummary("empty");
      expect(summary.areasMonitored).toBe(0);
      expect(summary.analysesCount).toBe(0);
      expect(summary.changesDetected).toBe(0);
      expect(summary.highPriorityCount).toBe(0);
      expect(summary).toEqual(EMPTY_SUMMARY);
    });

    it("returns explicit fixture counts in demo mode", async () => {
      const summary = await fetchDashboardSummary("demo");
      expect(summary.areasMonitored).toBe(4);
      expect(summary.analysesCount).toBe(6);
      expect(summary.changesDetected).toBe(9);
      expect(summary.highPriorityCount).toBe(2);
      expect(summary).toEqual(DEMO_SUMMARY);
    });
  });

  describe("fetchRecentInvestigations", () => {
    it("returns empty array in default empty mode", async () => {
      const list = await fetchRecentInvestigations("empty");
      expect(list).toEqual([]);
    });

    it("returns structured investigations in demo mode", async () => {
      const list = await fetchRecentInvestigations("demo");
      expect(list.length).toBeGreaterThanOrEqual(3);
      expect(list[0].id).toBe("ANL-2026-089");
      expect(list[0].environmentId).toBe("river");
    });
  });

  describe("fetchPriorityFindings", () => {
    it("returns empty array in default empty mode", async () => {
      const findings = await fetchPriorityFindings("empty");
      expect(findings).toEqual([]);
    });

    it("enforces cautious problem naming and confidence ranges in demo fixtures", async () => {
      const findings = await fetchPriorityFindings("demo");
      expect(findings.length).toBe(2);

      for (const finding of findings) {
        // Cautious naming assertion
        expect(finding.problemType).toMatch(/^Potential /);
        // Confidence range between 0.0 and 1.0
        expect(finding.confidence).toBeGreaterThanOrEqual(0.0);
        expect(finding.confidence).toBeLessThanOrEqual(1.0);
        // Both severity and priority exist separately
        expect(finding.severity).toBeDefined();
        expect(finding.priority).toBeDefined();
      }
    });
  });

  describe("fetchRecentActivity", () => {
    it("returns empty array in default empty mode", async () => {
      const activities = await fetchRecentActivity("empty");
      expect(activities).toEqual([]);
    });

    it("returns operational event stream in demo mode", async () => {
      const activities = await fetchRecentActivity("demo");
      expect(activities.length).toBeGreaterThan(0);
      expect(activities[0].title).toBeDefined();
      expect(activities[0].timestamp).toBeDefined();
    });
  });
});
