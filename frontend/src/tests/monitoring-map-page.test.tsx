import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import MonitoringMapPage from "@/app/monitoring-map/page";

describe("MonitoringMapPage", () => {
  it("renders the empty state and controls when there is no monitoring data", () => {
    render(<MonitoringMapPage />);

    expect(screen.getByRole("heading", { name: /monitoring map/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /environment/i })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: /priority/i })).toBeInTheDocument();
    expect(screen.getByText(/no monitored areas yet/i)).toBeInTheDocument();
  });

  it("shows the demo-data notice when using demo mode", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        state: "ready",
        demo_mode: true,
        message: "Demo data",
        features: [
          {
            id: "demo-1",
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [76.25, 10.1],
            },
            properties: {
              environment: "river",
              problem_type: "Potential Riverbank Erosion",
              investigation_priority: "high",
              confidence: 0.82,
            },
          },
        ],
      }),
    }) as typeof fetch;

    render(<MonitoringMapPage />);

    expect(await screen.findByText(/demo data/i)).toBeInTheDocument();
  });
});
