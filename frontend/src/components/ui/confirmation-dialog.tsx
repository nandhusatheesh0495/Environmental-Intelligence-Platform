import * as React from "react";
import { Modal } from "./modal";
import { Button } from "./button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "primary" | "destructive";
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  isLoading = false,
}: ConfirmationDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant}
            size="sm"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex gap-3 py-2">
        {variant === "destructive" ? (
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600" />
        ) : (
          <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-700" />
        )}
        <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
      </div>
    </Modal>
  );
}
