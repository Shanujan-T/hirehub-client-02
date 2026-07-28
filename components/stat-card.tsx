import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Optional extra classes on the outer icon badge shell */
  iconClassName?: string;
}) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/70 bg-card p-5 shadow-sm",
        "ring-1 ring-border/50 dark:bg-card/95 dark:ring-white/[0.06] dark:shadow-lg dark:shadow-black/30"
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-brand-gradient opacity-35" />
      <span
        className={cn(
          "absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl border border-border/70",
          "bg-[linear-gradient(135deg,color-mix(in_srgb,#08308b_14%,var(--color-card)),color-mix(in_srgb,#4d2bd8_12%,var(--color-card)),color-mix(in_srgb,#7d07db_10%,var(--color-card)))]",
          "shadow-md shadow-secondary/10 dark:border-white/10 dark:shadow-black/25",
          iconClassName
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient shadow-sm shadow-secondary/30">
          <Icon className="h-4 w-4 text-white" aria-hidden />
        </span>
      </span>
      <p className="pr-14 text-3xl font-extrabold tabular-nums tracking-tight text-foreground">{value}</p>
      <p className="mt-1 text-sm font-medium text-muted">{label}</p>
    </Card>
  );
}

export function StatCardGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}>{children}</div>
  );
}

export function DashboardPanel({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "border-border/70 bg-card p-5 shadow-sm ring-1 ring-border/50",
        "dark:bg-card/95 dark:ring-white/[0.06] dark:shadow-lg dark:shadow-black/30",
        className
      )}
    >
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {children}
    </Card>
  );
}
