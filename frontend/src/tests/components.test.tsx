import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { DropZone } from "@/components/ui/dropzone";
import { Modal } from "@/components/ui/modal";

describe("Reusable UI Components", () => {
  describe("Button", () => {
    it("renders children and handles click events", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Analyze Area</Button>);
      const btn = screen.getByRole("button", { name: /analyze area/i });
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("disables button when disabled or isLoading is true", () => {
      const { rerender } = render(<Button disabled>Disabled Button</Button>);
      expect(screen.getByRole("button")).toBeDisabled();

      rerender(<Button isLoading>Loading Button</Button>);
      expect(screen.getByRole("button")).toBeDisabled();
    });
  });

  describe("StatusBadge", () => {
    it("renders status label with appropriate styling", () => {
      render(<StatusBadge label="Potential Riverbank Erosion" variant="high" />);
      expect(screen.getByText("Potential Riverbank Erosion")).toBeInTheDocument();
    });
  });

  describe("Alert", () => {
    it("renders alert role with title and content", () => {
      render(
        <Alert variant="warning" title="Sensor Alignment Notice">
          Imagery timestamps indicate 42-day gap.
        </Alert>
      );
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Sensor Alignment Notice")).toBeInTheDocument();
      expect(
        screen.getByText("Imagery timestamps indicate 42-day gap.")
      ).toBeInTheDocument();
    });
  });

  describe("Input", () => {
    it("renders label, value, and accessible error attributes", () => {
      render(
        <Input
          label="Target Reach"
          error="Reach name is required"
          helperText="Format: River - Section"
        />
      );
      expect(screen.getByText("Target Reach")).toBeInTheDocument();
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByText("Reach name is required")).toBeInTheDocument();
    });
  });

  describe("DropZone", () => {
    it("renders upload call to action", () => {
      render(<DropZone label="Before Imagery" />);
      expect(screen.getByText("Before Imagery")).toBeInTheDocument();
      expect(
        screen.getByText(/click to upload or drag & drop/i)
      ).toBeInTheDocument();
    });
  });

  describe("Modal", () => {
    it("renders title and content when open", () => {
      render(
        <Modal
          isOpen={true}
          onClose={vi.fn()}
          title="Confirm Human Review"
          description="Officer sign-off dialog"
        >
          <p>Please verify before publishing report.</p>
        </Modal>
      );
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Confirm Human Review")).toBeInTheDocument();
      expect(
        screen.getByText("Please verify before publishing report.")
      ).toBeInTheDocument();
    });

    it("does not render when isOpen is false", () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()} title="Closed Modal">
          <p>Hidden Content</p>
        </Modal>
      );
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
