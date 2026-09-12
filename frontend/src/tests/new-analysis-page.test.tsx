import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import NewAnalysisPage from "@/app/new-analysis/page";

describe("NewAnalysisPage (Phase 3 workflow)", () => {
  it("shows the guided workflow and can switch environment-specific questions", async () => {
    render(<NewAnalysisPage />);

    expect(screen.getByRole("heading", { name: /new environmental analysis/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /select environment/i })).toBeInTheDocument();

    const riverRadio = screen.getByRole("radio", { name: /river basin & riparian corridor/i });
    expect(riverRadio).toBeChecked();

    fireEvent.click(screen.getByRole("radio", { name: /slope & landslide risk corridor/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    fireEvent.change(screen.getByLabelText(/area \/ site name/i), { target: { value: "Wayanad Ridge" } });
    fireEvent.change(screen.getByLabelText(/district/i), { target: { value: "Wayanad" } });
    fireEvent.change(screen.getByLabelText(/state \/ region/i), { target: { value: "Kerala" } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: "India" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/slope \/ mountain range sector/i)).toBeInTheDocument();
    });
  });

  it("blocks invalid submissions and requires required location fields", async () => {
    render(<NewAnalysisPage />);

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/district is required/i)).toBeInTheDocument();
    });
  });

  it("allows a valid river workflow to move through imagery and review", async () => {
    render(<NewAnalysisPage />);

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.change(screen.getByLabelText(/area \/ site name/i), { target: { value: "Periyar River Reach" } });
    fireEvent.change(screen.getByLabelText(/district/i), { target: { value: "Ernakulam" } });
    fireEvent.change(screen.getByLabelText(/state \/ region/i), { target: { value: "Kerala" } });
    fireEvent.change(screen.getByLabelText(/country/i), { target: { value: "India" } });
    fireEvent.change(screen.getByLabelText(/latitude/i), { target: { value: "10.0159" } });
    fireEvent.change(screen.getByLabelText(/longitude/i), { target: { value: "76.2711" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    expect(screen.getByText(/river name and basin/i)).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/river name and basin/i), {
      target: { value: "Periyar River - Lower Reach" },
    });
    fireEvent.change(screen.getByLabelText(/has there been a significant precipitation or dam discharge event within the last 14 days/i), {
      target: { value: "No - Normal Flow" },
    });
    fireEvent.change(screen.getByLabelText(/hydrological stage comparison/i), {
      target: { value: "Same Season (Monsoon vs Monsoon)" },
    });
    fireEvent.click(screen.getByLabelText(/potential riverbank erosion/i));

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    const beforeFile = new File(["before-image"], "before.png", { type: "image/png" });
    const beforeInput = screen.getByLabelText(/before image/i);
    fireEvent.change(beforeInput, { target: { files: [beforeFile] } });

    const afterFile = new File(["after-image"], "after.png", { type: "image/png" });
    const afterInput = screen.getByLabelText(/after image/i);
    fireEvent.change(afterInput, { target: { files: [afterFile] } });

    fireEvent.change(screen.getByLabelText(/before date/i), { target: { value: "2025-01-01" } });
    fireEvent.change(screen.getByLabelText(/after date/i), { target: { value: "2025-02-01" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByText(/review analysis preparation/i)).toBeInTheDocument();
    });
  });
});
