import Image from "next/image";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function CommunityAvatar({
  name,
  imageUrl,
  className,
  size = "md",
}: {
  name: string;
  imageUrl?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = getInitials(name);
  const sizes = {
    sm: "h-10 w-10 text-xs",
    md: "h-14 w-14 text-sm",
    lg: "h-20 w-20 text-lg",
  };
  const dimensions = {
    sm: 40,
    md: 56,
    lg: 80,
  };

  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={`${name} community image`}
        width={dimensions[size]}
        height={dimensions[size]}
        className={cn("inline-flex shrink-0 rounded-2xl object-cover shadow-sm", sizes[size], className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-2xl bg-brand-gradient font-bold text-white shadow-sm",
        sizes[size],
        className
      )}
      aria-hidden={!!name}
    >
      {initials || "?"}
    </span>
  );
}
