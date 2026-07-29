"use client";

import { useRef, useState } from "react";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

const DEFAULT_ACCEPT = "image/jpeg,image/png,application/pdf";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function validateDocument(file: File): string | null {
  const allowed = ["image/jpeg", "image/png", "application/pdf"];
  if (!allowed.includes(file.type)) {
    return "Only JPG, PNG, and PDF files are allowed.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "File must be 5MB or smaller.";
  }
  return null;
}

export function DocumentUploadControl({
  label,
  accept = DEFAULT_ACCEPT,
  helperText = "JPG, PNG, or PDF up to 5MB.",
  disabled = false,
  file,
  onFileChange,
}: {
  label: string;
  accept?: string;
  helperText?: string;
  disabled?: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (next: File | undefined) => {
    if (!next || disabled) return;
    const validationError = validateDocument(next);
    if (validationError) {
      setError(validationError);
      onFileChange(null);
      return;
    }
    setError(null);
    onFileChange(next);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-foreground">{label}</p>
      <div
        className={cn(
          "flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-background/40 p-4 sm:flex-row",
          dragOver && !disabled && "border-info bg-info/5",
          disabled && "cursor-not-allowed opacity-60"
        )}
        onDragOver={(event) => {
          if (disabled) return;
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          if (disabled) return;
          event.preventDefault();
          setDragOver(false);
          handleFile(event.dataTransfer.files?.[0]);
        }}
      >
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-border bg-card">
          <FileText className="h-10 w-10 text-muted" aria-hidden />
        </div>

        <div className="flex flex-col items-center gap-2 sm:items-start">
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="hidden"
            disabled={disabled}
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="mr-1.5 h-4 w-4" aria-hidden />
            Choose file
          </Button>
          <p className="text-xs text-muted">{helperText} Drag and drop supported.</p>
          {file && (
            <p className="text-xs text-foreground">
              Selected: <span className="font-medium">{file.name}</span>
            </p>
          )}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
      </div>
    </div>
  );
}

export function validateNicDocumentFile(file: File): string | null {
  return validateDocument(file);
}
