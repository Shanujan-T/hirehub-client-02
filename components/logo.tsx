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

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden shadow-md shadow-secondary/20",
        sizeClass,
        className
      )}
    >
      <img
        src="/logo-light.png"
        alt="HireHub Logo"
        className="block dark:hidden h-full w-full object-cover"
      />
      <img
        src="/logo-dark.png"
        alt="HireHub Logo"
        className="hidden dark:block h-full w-full object-cover"
      />
    </span>
  );
}

