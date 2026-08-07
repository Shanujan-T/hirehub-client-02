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

export function UserAvatar({
  name,
  avatarUrl,
  className,
  size = "md",
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = getInitials(name);

  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-base",
  };

  const dimensions = {
    sm: 36,
    md: 44,
    lg: 56,
  };

  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={`${name} avatar`}
        width={dimensions[size]}
        height={dimensions[size]}
        className={cn(
          "inline-flex shrink-0 rounded-full object-cover shadow-sm",
          sizes[size],
          className,
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-brand-gradient font-bold text-white shadow-sm",
        sizes[size],
        className,
      )}
      aria-hidden={!!name}
    >
      {initials || "?"}
    </span>
  );
}

export function roleLabel(role: string) {
  if (role === "user") return "User";
  if (role === "admin") return "Admin";
  return role;
}

export function roleBadgeVariant(
  role: string,
): "info" | "active" | "completed" | "default" {
  if (role === "admin") return "completed";
  return "info";
}
