"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel,
  confirmVariant = "gradient",
  titleId = "confirm-dialog-title",
  descId = "confirm-dialog-desc",
  dismissLabel = "Dismiss dialog",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  cancelLabel?: string;
  confirmLabel: string;
  confirmVariant?: "default" | "gradient" | "gradientCommunity" | "outline" | "destructive" | "ghost";
  titleId?: string;
  descId?: string;
  dismissLabel?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
      role="presentation"
    >
      <button
        type="button"
        aria-label={dismissLabel}
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        className={cn(
          "relative z-[1] w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xl",
          "dark:border-white/10 dark:bg-[#0f1729] dark:shadow-black/40"
        )}
      >
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
        <h2 id={titleId} className="text-lg font-extrabold text-foreground">
          {title}
        </h2>
        <p id={descId} className="mt-2 text-sm leading-relaxed text-muted">
          {description}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={confirmVariant}
            size="sm"
            className="rounded-full"
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
