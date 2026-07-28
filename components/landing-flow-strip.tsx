import { Briefcase, ChevronRight, UserCheck, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Briefcase,
    label: "Employers post",
    detail: "Jobs go live",
  },
  {
    icon: Users,
    label: "Communities apply",
    detail: "As teams",
  },
  {
    icon: UserCheck,
    label: "Admins assign",
    detail: "Work internally",
  },
] as const;

export function LandingFlowStrip({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-2xl", className)}>
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-center sm:gap-2">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.label} className="flex items-center gap-2 sm:contents">
              {index > 0 && (
                <ChevronRight
                  aria-hidden
                  className="hidden h-4 w-4 shrink-0 text-secondary/40 sm:block"
                />
              )}
              <div className="flex flex-1 flex-col items-center rounded-2xl border border-border/70 bg-card/70 px-3 py-4 shadow-sm backdrop-blur-sm dark:border-border/80 dark:bg-card/50 dark:shadow-md dark:shadow-black/20">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient shadow-md shadow-secondary/20">
                  <Icon className="h-5 w-5 text-white" aria-hidden />
                </span>
                <p className="mt-2.5 text-sm font-bold text-foreground">{step.label}</p>
                <p className="mt-0.5 text-xs text-muted">{step.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
