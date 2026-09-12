import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import OverviewPage from "@/app/page";

describe("OverviewPage (Environmental Overview Dashboard)", () => {
  it("renders Level 1 PageHeader and primary CTA linking to /new-analysis", async () => {
    render(<OverviewPage />);
    expect(screen.getByRole("heading", { level: 1, name: /environmental overview/i })).toBeInTheDocument();

    const ctas = screen.getAllByRole("link", { name: /start new analysis/i });
    expect(ctas.length).toBeGreaterThanOrEqual(1);
    expect(ctas[0]).toHaveAttribute("href", "/new-analysis");
  });

  it("renders default empty state without fabricating operational data", async () => {
    render(<OverviewPage />);
    await waitFor(() => {
      expect(screen.getByText("No findings requiring review")).toBeInTheDocument();
      expect(screen.getByText("No investigations yet")).toBeInTheDocument();
      expect(screen.getByText("No monitored areas")).toBeInTheDocument();
      expect(screen.getByText("No analyses yet")).toBeInTheDocument();
    });
  });

  it("supports previewing demonstration fixtures with an explicit disclaimer notice", async () => {
    render(<OverviewPage />);
    const toggleBtn = screen.getByRole("button", { name: /preview demo fixtures/i });
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      // Demo warning banner is shown
      expect(screen.getByText("Demonstration Test Fixtures Active")).toBeInTheDocument();
      // Priority findings are displayed
      expect(screen.getByText("Potential Riverbank Erosion")).toBeInTheDocument();
      // Monitored areas appear in table/findings
      expect(screen.getAllByText("Periyar River - Lower Reach Sector 4").length).toBeGreaterThanOrEqual(1);
    });

    // Toggle back to empty state
    const revertBtn = screen.getByRole("button", { name: /view empty state/i });
    fireEvent.click(revertBtn);

    await waitFor(() => {
      expect(screen.queryByText("Demonstration Test Fixtures Active")).not.toBeInTheDocument();
      expect(screen.getByText("No findings requiring review")).toBeInTheDocument();
    });
  });

  it("renders all dashboard levels in proper hierarchy", async () => {
    render(<OverviewPage />);
    // Level 2: Areas Requiring Attention
    expect(screen.getByRole("heading", { level: 2, name: /areas requiring attention/i })).toBeInTheDocument();
    // Level 4: Recent Investigations
    expect(screen.getByRole("heading", { level: 2, name: /recent investigations/i })).toBeInTheDocument();
    // Level 5: Environmental Monitoring Map
    expect(screen.getByRole("heading", { level: 2, name: /environmental monitoring map/i })).toBeInTheDocument();
    // Level 6: Monitoring Environments
    expect(screen.getByRole("heading", { level: 2, name: /monitoring environments/i })).toBeInTheDocument();
    // Level 7: Recent Activity
    expect(screen.getByRole("heading", { level: 2, name: /recent activity/i })).toBeInTheDocument();
  });
});
