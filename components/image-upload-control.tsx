"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Trash2, Upload } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ImageCropDialog } from "@/components/image-crop-dialog";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function validateFile(file: File): string | null {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return "Only JPG, PNG, and WEBP images are allowed.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "Image must be 5MB or smaller.";
  }
  return null;
}

export function ImageUploadControl({
  label,
  previewUrl,
  fallback,
  onUpload,
  onSelect,
  onRemove,
  uploading = false,
  shape = "circle",
  avatarEditOverlay = false,
}: {
  label: string;
  previewUrl?: string | null;
  fallback: React.ReactNode;
  /** Immediate upload (existing behavior). Ignored when `onSelect` is provided. */
  onUpload?: (file: File) => Promise<void>;
  /** Deferred select keeps a local preview until the parent form submits. */
  onSelect?: (file: File) => void;
  onRemove?: () => Promise<void>;
  uploading?: boolean;
  shape?: "circle" | "rounded";
  /** Makes the avatar clickable and enables crop-before-upload. */
  avatarEditOverlay?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [cropSelection, setCropSelection] = useState<{ file: File; source: string } | null>(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalPreview((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return null;
    });
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  useEffect(() => {
    return () => {
      if (cropSelection) URL.revokeObjectURL(cropSelection.source);
    };
  }, [cropSelection]);

  const displayUrl = localPreview ?? previewUrl ?? null;

  const closeCrop = () => setCropSelection(null);

  const uploadWithPreview = async (file: File) => {
    if (!onUpload) return;
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    try {
      await onUpload(file);
    } finally {
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
    }
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    if (avatarEditOverlay && onUpload) {
      setCropSelection({ file, source: URL.createObjectURL(file) });
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    if (onSelect) {
      onSelect(file);
      return;
    }
    if (!onUpload) return;
    try {
      await onUpload(file);
    } finally {
      URL.revokeObjectURL(objectUrl);
      setLocalPreview(null);
    }
  };

  const handleCroppedSave = async (file: File) => {
    closeCrop();
    await uploadWithPreview(file);
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div
        className={cn(
          "flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-background/40 p-4 sm:flex-row",
          avatarEditOverlay && "sm:flex-col",
          dragOver && "border-info bg-info/5",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void handleFile(event.dataTransfer.files?.[0]);
        }}
      >
        <button
          type="button"
          disabled={uploading || !avatarEditOverlay}
          aria-label={uploading ? "Uploading profile picture" : "Edit profile picture"}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "group relative shrink-0 rounded-full outline-none transition focus-visible:ring-2 focus-visible:ring-info/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            avatarEditOverlay ? "cursor-pointer" : "pointer-events-none",
            shape === "rounded" && "rounded-2xl",
          )}
        >
          <span className={cn("relative block overflow-hidden", shape === "circle" ? "rounded-full" : "rounded-2xl")}>
            {displayUrl ? (
              <Image
                src={displayUrl}
                alt="Upload preview"
                width={112}
                height={112}
                className={cn(
                  "object-cover",
                  shape === "circle" ? "h-24 w-24" : "h-24 w-24 sm:h-28 sm:w-28",
                )}
              />
            ) : (
              fallback
            )}
            {avatarEditOverlay && uploading && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white" aria-hidden>
                <Loader2 className="h-6 w-6 animate-spin" />
              </span>
            )}
          </span>

          {avatarEditOverlay && !uploading && (
            <span
              className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-card shadow-md transition-transform group-hover:scale-105"
              aria-hidden
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-gradient text-white">
                <Pencil className="h-3.5 w-3.5" />
              </span>
            </span>
          )}
        </button>

        <div
          className={cn(
            "flex flex-col items-center gap-2",
            avatarEditOverlay ? "sm:items-center" : "sm:items-start",
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void handleFile(file);
            }}
          />
          {!avatarEditOverlay && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="mr-1.5 h-4 w-4" aria-hidden />
              {uploading ? "Uploading…" : "Choose image"}
            </Button>
          )}
          <p className="text-xs text-muted">
            JPG, PNG, or WEBP up to 5MB. Drag and drop supported.
          </p>
          {avatarEditOverlay && previewUrl && onRemove && (
            <button
              type="button"
              disabled={uploading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setRemoveConfirmOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden />
              Remove photo
            </button>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>

      <ImageCropDialog
        open={Boolean(cropSelection)}
        source={cropSelection?.source ?? null}
        file={cropSelection?.file ?? null}
        onCancel={closeCrop}
        onSave={handleCroppedSave}
      />
      <ConfirmDialog
        open={removeConfirmOpen}
        onClose={() => setRemoveConfirmOpen(false)}
        onConfirm={() => {
          setRemoveConfirmOpen(false);
          void onRemove?.().catch(() => undefined);
        }}
        title="Remove profile picture?"
        description="Your photo will be removed and your initials will be shown instead."
        confirmLabel="Remove photo"
        confirmVariant="destructive"
      />
    </div>
  );
}
