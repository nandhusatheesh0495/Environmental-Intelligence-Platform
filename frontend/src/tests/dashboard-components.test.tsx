import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SummaryMetric } from "@/components/dashboard/summary-metric";
import { PriorityFindingCard } from "@/components/dashboard/priority-finding-card";
import { InvestigationsTable } from "@/components/dashboard/investigations-table";
import { MapPlaceholder } from "@/components/dashboard/map-placeholder";
import { RecentActivityList } from "@/components/dashboard/recent-activity-list";
import { EnvironmentSummary } from "@/components/dashboard/environment-summary";
import { DEMO_PRIORITY_FINDINGS, DEMO_INVESTIGATIONS, DEMO_ACTIVITIES } from "@/services/dashboard";
import { Layers } from "lucide-react";

describe("Dashboard UI Components", () => {
  describe("SummaryMetric", () => {
    it("renders label and positive metric value correctly", () => {
      render(
        <SummaryMetric
          label="Areas Monitored"
          value={4}
          helperText="Active river sectors"
          icon={Layers}
        />
      );
      expect(screen.getByText("Areas Monitored")).toBeInTheDocument();
      expect(screen.getByText("4")).toBeInTheDocument();
      expect(screen.getByText("Active river sectors")).toBeInTheDocument();
    });

    it("displays empty fallback when value is 0 or null", () => {
      render(
        <SummaryMetric
          label="Analyses"
          value={0}
          emptyLabel="No analyses yet"
        />
      );
      expect(screen.getByText("Analyses")).toBeInTheDocument();
      expect(screen.getByText("0")).toBeInTheDocument();
      expect(screen.getByText("No analyses yet")).toBeInTheDocument();
    });
  });

  describe("PriorityFindingCard", () => {
    const finding = DEMO_PRIORITY_FINDINGS[0];

    it("renders cautious problem name, area, and separate priority/severity badges", () => {
      render(<PriorityFindingCard finding={finding} />);
      expect(screen.getByText("Potential Riverbank Erosion")).toBeInTheDocument();
      expect(screen.getByText(finding.areaName)).toBeInTheDocument();
      expect(screen.getByText("Change Severity: High")).toBeInTheDocument();
      expect(screen.getByText("Investigation Priority: High")).toBeInTheDocument();
    });

    it("renders AI confidence and required disclaimer against disaster probability", () => {
      render(<PriorityFindingCard finding={finding} />);
      expect(screen.getByText("AI Confidence: 88%")).toBeInTheDocument();
      expect(
        screen.getByText(/does not represent disaster probability/i)
      ).toBeInTheDocument();
    });

    it("fires onReview handler when action button is clicked", () => {
      const handleReview = vi.fn();
      render(<PriorityFindingCard finding={finding} onReview={handleReview} />);
      const btn = screen.getByRole("button", { name: /inspect evidence/i });
      fireEvent.click(btn);
      expect(handleReview).toHaveBeenCalledWith(finding);
    });
  });

  describe("InvestigationsTable", () => {
    it("renders table with investigations on populated state", () => {
      render(<InvestigationsTable investigations={DEMO_INVESTIGATIONS} />);
      // Both desktop table and mobile stack are in DOM in JSDOM, so use getAllByText
      expect(screen.getAllByText("Periyar River - Lower Reach Sector 4").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Wayanad Escarpment - Ridge Sector B").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Aug 2026 → Sep 2026").length).toBeGreaterThanOrEqual(1);
    });

    it("renders empty state with Start New Analysis action when empty", () => {
      render(<InvestigationsTable investigations={[]} />);
      expect(screen.getByText("No investigations yet")).toBeInTheDocument();
      const link = screen.getByRole("link", { name: /start new analysis/i });
      expect(link).toHaveAttribute("href", "/new-analysis");
    });
  });

  describe("MapPlaceholder", () => {
    it("renders Phase 4 roadmap tag and explanatory message", () => {
      render(<MapPlaceholder hasMonitoredAreas={false} />);
      expect(screen.getByText("Environmental Monitoring Map")).toBeInTheDocument();
      expect(screen.getByText("Phase 4 Engine")).toBeInTheDocument();
      expect(
        screen.getByText(/interactive monitoring and spatial bounding polygons/i)
      ).toBeInTheDocument();
    });
  });

  describe("RecentActivityList", () => {
    it("renders event list when activities exist", () => {
      render(<RecentActivityList activities={DEMO_ACTIVITIES} />);
      expect(screen.getByText("Potential Riverbank Erosion identified")).toBeInTheDocument();
      expect(screen.getByText("2 hours ago")).toBeInTheDocument();
    });

    it("renders empty message when no activities exist", () => {
      render(<RecentActivityList activities={[]} />);
      expect(screen.getByText("No recent activity")).toBeInTheDocument();
    });
  });

  describe("EnvironmentSummary", () => {
    it("displays River as primary and Landslide as secondary with links to catalog", () => {
      render(<EnvironmentSummary />);
      expect(screen.getByText("River Basin & Riparian Corridor")).toBeInTheDocument();
      expect(screen.getByText("Primary MVP")).toBeInTheDocument();
      expect(screen.getByText("Slope & Landslide Risk Corridor")).toBeInTheDocument();
      expect(screen.getByText("Secondary MVP")).toBeInTheDocument();
      const links = screen.getAllByRole("link", { name: /catalog specs/i });
      expect(links.length).toBeGreaterThanOrEqual(2);
      expect(links[0]).toHaveAttribute("href", "/environments");
    });
  });
});
