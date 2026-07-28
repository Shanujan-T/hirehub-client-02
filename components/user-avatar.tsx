import { cn } from "@/lib/utils";

export function UserAvatar({
  name,
  className,
  size = "md",
}: {
  name: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  const sizes = {
    sm: "h-9 w-9 text-xs",
    md: "h-11 w-11 text-sm",
    lg: "h-14 w-14 text-base",
  };

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-brand-gradient font-bold text-white shadow-sm",
        sizes[size],
        className
      )}
      aria-hidden={!!name}
    >
      {initials || "?"}
    </span>
  );
}

export function roleLabel(role: string) {
  if (role === "user") return "Member";
  if (role === "employer") return "Employer";
  if (role === "admin") return "Admin";
  return role;
}

export function roleBadgeVariant(role: string): "info" | "active" | "completed" | "default" {
  if (role === "admin") return "completed";
  if (role === "employer") return "active";
  return "info";
}
