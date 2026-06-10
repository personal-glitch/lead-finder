"use client";
import type { ReactNode } from "react";
import { Modal, Button, Spinner } from "@/components/ui";

/** Schlichtes, hübsches Bestätigungs-Fenster statt des Browser-confirm(). */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Löschen",
  cancelLabel = "Abbrechen",
  danger = true,
  busy = false,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>{cancelLabel}</Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} disabled={busy}>
            {busy ? <Spinner size={14} /> : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-[var(--color-ink-2)]">{message}</p>
    </Modal>
  );
}
