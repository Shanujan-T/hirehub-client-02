"use client";

import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
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
  uploading = false,
  shape = "circle",
}: {
  label: string;
  previewUrl?: string | null;
  fallback: React.ReactNode;
  /** Immediate upload (existing behavior). Ignored when `onSelect` is provided. */
  onUpload?: (file: File) => Promise<void>;
  /** Deferred select — keeps a local preview; parent submits later. */
  onSelect?: (file: File) => void;
  uploading?: boolean;
  shape?: "circle" | "rounded";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const displayUrl = localPreview ?? previewUrl ?? null;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
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

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div
        className={cn(
          "flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-background/40 p-4 sm:flex-row",
          dragOver && "border-info bg-info/5"
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
        <div
          className={cn(
            "overflow-hidden",
            shape === "circle" ? "rounded-full" : "rounded-2xl"
          )}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Upload preview"
              className={cn(
                "object-cover",
                shape === "circle" ? "h-24 w-24" : "h-24 w-24 sm:h-28 sm:w-28"
              )}
            />
          ) : (
            fallback
          )}
        </div>

        <div className="flex flex-col items-center gap-2 sm:items-start">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(event) => void handleFile(event.target.files?.[0])}
          />
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
          <p className="text-xs text-muted">JPG, PNG, or WEBP up to 5MB. Drag and drop supported.</p>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}
