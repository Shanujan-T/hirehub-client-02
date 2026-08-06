"use client";

import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClass = { sm: "h-8 w-8", md: "h-9 w-9", lg: "h-11 w-11" }[size];
  const iconSizeClass = { sm: "h-4 w-4", md: "h-[18px] w-[18px]", lg: "h-6 w-6" }[size];

  return (
    <span className={cn("flex items-center justify-center rounded-xl bg-brand-gradient shadow-md shrink-0", sizeClass, className)}>
      <Briefcase className={cn("text-white", iconSizeClass)} />
    </span>
  );
}
