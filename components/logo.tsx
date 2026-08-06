"use client";

import { useTheme } from "next-themes";
import Image from "next/image";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dimensions = { sm: 32, md: 36, lg: 44 }[size];
  const sizeClass = { sm: "h-8 w-8", md: "h-9 w-9", lg: "h-11 w-11" }[size];

  if (!mounted) {
    // Avoid hydration mismatch — render a neutral placeholder of the same size until mounted
    return (
      <div 
        className={cn("bg-muted/20 rounded-xl", sizeClass, className)} 
        style={{ width: dimensions, height: dimensions }} 
      />
    );
  }

  const src = resolvedTheme === "dark" ? "/logo-dark.png" : "/logo-light.png";

  return (
    <Image 
      src={src} 
      alt="HireHub" 
      width={dimensions} 
      height={dimensions} 
      className={cn("rounded-xl object-cover shadow-md", sizeClass, className)} 
      priority 
    />
  );
}
