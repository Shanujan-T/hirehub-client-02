"use client";

import { CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { VERIFIED_IDENTITY_TOOLTIP } from "@/lib/identity-verified-copy";
import { cn } from "@/lib/utils";

type VerifiedIdentityBadgeProps = {
  className?: string;
  /** Use StatusBadge styling (default) or compact icon+label only */
  variant?: "badge" | "compact";
};

/** Verified identity badge with shared explainer tooltip (hover + tap). */
export function VerifiedIdentityBadge({ className, variant = "badge" }: VerifiedIdentityBadgeProps) {
  const trigger =
    variant === "compact" ? (
      <span className={cn("inline-flex items-center gap-1 text-success", className)}>
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="text-xs font-bold">Verified</span>
      </span>
    ) : (
      <StatusBadge status="verified" kind="identity" showVerifiedExplainer={false} />
    );

  return (
    <Tooltip>
      <TooltipTrigger className={className}>{trigger}</TooltipTrigger>
      <TooltipContent>{VERIFIED_IDENTITY_TOOLTIP}</TooltipContent>
    </Tooltip>
  );
}

export function VerifiedIdentityExplainer({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger>{children}</TooltipTrigger>
      <TooltipContent>{VERIFIED_IDENTITY_TOOLTIP}</TooltipContent>
    </Tooltip>
  );
}
