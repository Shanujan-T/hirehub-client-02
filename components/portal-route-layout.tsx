import { cn } from "@/lib/utils";

/** Shared min-height wrapper for authenticated portal route groups. */
export function PortalRouteLayout({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("portal-root flex min-h-screen flex-1 flex-col", className)}>{children}</div>
  );
}
