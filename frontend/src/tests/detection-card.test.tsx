import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DetectionCard } from "@/components/ui/detection-card";

describe("DetectionCard", () => {
  it("renders detection summary, priority, and expandable evidence", () => {
    render(
      <DetectionCard
        problemType="Potential Riverbank Erosion"
        confidence={0.78}
        confidenceLabel="Moderate confidence"
        priority="High"
        evidenceCount={3}
        explanation="Visual change is concentrated along the riverbank and should be verified repeatedly."
        recommendation="Field verification recommended."
        evidence={[
          "8.4% of the image contains detected visual change.",
          "The primary changed region follows the river boundary.",
        ]}
      />
    );

    expect(screen.getByText("Potential Riverbank Erosion")).toBeInTheDocument();
    expect(screen.getAllByText(/78%/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/high/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /view evidence/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /view evidence/i }));
    expect(screen.getByText("8.4% of the image contains detected visual change.")).toBeInTheDocument();
  });

  it("does not show disaster probability language", () => {
    render(
      <DetectionCard
        problemType="Potential Terrain Disturbance"
        confidence={0.61}
        confidenceLabel="Moderate confidence"
        priority="Moderate"
        evidenceCount={2}
        explanation="Change is concentrated in a disturbed slope surface."
        recommendation="Field verification recommended."
        evidence={["Change is localized."]}
      />
    );

    expect(screen.queryByText(/disaster probability/i)).not.toBeInTheDocument();
  });
});
