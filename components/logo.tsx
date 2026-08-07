"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

/** ~32–48px slots — artwork uses object-contain so it isn't clipped. */
const SIZE_CLASS = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
} as const;

/** Cache-bust after transparent reprocess of the light mark. */
const LIGHT_SRC = "/logo-light.png?v=2";
/** Dark mark left as-is (baked dark plate is intentional for dark UI). */
const DARK_SRC = "/logo-dark.png";

/**
 * Theme-aware HireHub mark (navbar / sidebar / auth — one source of truth).
 * Picks the asset from resolvedTheme so light mode never shows the dark plate.
 */
export function Logo({ className, size = "md" }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Before mount, default to the transparent light mark (safe on white navbar).
  const isDark = mounted && resolvedTheme === "dark";
  const src = isDark ? DARK_SRC : LIGHT_SRC;

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center bg-transparent",
        SIZE_CLASS[size],
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- theme-switched static asset */}
      <img
        src={src}
        alt="HireHub"
        width={48}
        height={48}
        className="h-full w-full bg-transparent object-contain"
        draggable={false}
      />
    </span>
  );
}
