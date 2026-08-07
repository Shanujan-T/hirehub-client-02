import { Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, size = "md" }: LogoProps) {
  const sizeClass = { 
    sm: "h-8 w-8 rounded-lg", 
    md: "h-9 w-9 rounded-xl", 
    lg: "h-11 w-11 rounded-xl" 
  }[size];
  
  const iconClass = { 
    sm: "h-4 w-4", 
    md: "h-5 w-5", 
    lg: "h-6 w-6" 
  }[size];

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center bg-brand-gradient text-white shadow-md shadow-secondary/20",
        sizeClass,
        className
      )}
    >
      <Briefcase className={iconClass} aria-hidden />
    </span>
  );
}

