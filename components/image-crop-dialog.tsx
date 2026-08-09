"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Loader2 } from "lucide-react";
import { Button, Label } from "@/components/ui";

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = source;
  });
}

async function createCroppedFile(source: string, crop: Area, originalFile: File) {
  const image = await loadImage(source);
  const outputSize = 512;
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Image cropping is unavailable in this browser.");

  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  const outputType = originalFile.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => (value ? resolve(value) : reject(new Error("Unable to crop this image."))),
      outputType,
      0.9,
    );
  });
  const extension = outputType === "image/png" ? ".png" : ".jpg";
  const baseName = originalFile.name.replace(/\.[^.]+$/, "") || "avatar";
  return new File([blob], `${baseName}-cropped${extension}`, {
    type: outputType,
    lastModified: Date.now(),
  });
}

export function ImageCropDialog({
  open,
  source,
  file,
  onCancel,
  onSave,
}: {
  open: boolean;
  source: string | null;
  file: File | null;
  onCancel: () => void;
  onSave: (file: File) => Promise<void>;
}) {
  const [mounted, setMounted] = useState(false);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedArea(null);
    setError(null);
  }, [open, source]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !processing) onCancel();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onCancel, processing]);

  if (!open || !mounted || !source || !file) return null;

  const handleSave = async () => {
    if (!croppedArea) return;
    setProcessing(true);
    setError(null);
    try {
      await onSave(await createCroppedFile(source, croppedArea, file));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to crop this image.");
    } finally {
      setProcessing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6" role="presentation">
      <button
        type="button"
        aria-label="Cancel image crop"
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
        disabled={processing}
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-crop-title"
        aria-describedby="image-crop-description"
        className="relative z-[1] w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-xl dark:border-white/10 dark:bg-[#0f1729] dark:shadow-black/40 sm:p-6"
      >
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
        <h2 id="image-crop-title" className="text-lg font-extrabold text-foreground">
          Adjust profile picture
        </h2>
        <p id="image-crop-description" className="mt-1 text-sm text-muted">
          Drag to reposition your photo and use the slider to zoom.
        </p>

        <div className="relative mt-5 h-72 overflow-hidden rounded-2xl bg-surface-dark sm:h-80">
          <Cropper
            image={source}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_area, pixels) => setCroppedArea(pixels)}
          />
        </div>

        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="avatar-crop-zoom">Zoom</Label>
            <span className="text-xs tabular-nums text-muted">{zoom.toFixed(1)}×</span>
          </div>
          <input
            id="avatar-crop-zoom"
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            disabled={processing}
            onChange={(event) => setZoom(Number(event.target.value))}
            className="h-2 w-full cursor-pointer accent-secondary disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" className="rounded-full" disabled={processing} onClick={onCancel}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="gradient"
            size="sm"
            className="min-w-20 rounded-full"
            disabled={processing || !croppedArea}
            onClick={() => void handleSave()}
          >
            {processing ? <Loader2 className="h-4 w-4 animate-spin" aria-label="Cropping image" /> : "Save"}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
