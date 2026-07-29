"use client";

import { useId, useState } from "react";
import { cn } from "@/lib/utils";

type TooltipContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  contentId: string;
};

import { createContext, useContext } from "react";

const TooltipCtx = createContext<TooltipContextValue | null>(null);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const contentId = useId();
  return (
    <TooltipCtx.Provider value={{ open, setOpen, contentId }}>
      <span className="relative inline-flex">{children}</span>
    </TooltipCtx.Provider>
  );
}

export function TooltipTrigger({
  children,
  className,
}: {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TooltipCtx);
  if (!ctx) return <>{children}</>;

  const toggle = () => ctx.setOpen(!ctx.open);
  const show = () => ctx.setOpen(true);
  const hide = () => ctx.setOpen(false);

  return (
    <span
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={(e) => {
        e.preventDefault();
        toggle();
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") ctx.setOpen(false);
      }}
      aria-describedby={ctx.open ? ctx.contentId : undefined}
      tabIndex={0}
      role="button"
      className={cn(
        "inline-flex cursor-help rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-info/40",
        className
      )}
    >
      {children}
    </span>
  );
}

export function TooltipContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = useContext(TooltipCtx);
  if (!ctx?.open) return null;

  return (
    <span
      id={ctx.contentId}
      role="tooltip"
      className={cn(
        "absolute bottom-full left-1/2 z-[100] mb-2 w-max max-w-[min(16rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-border bg-card px-3 py-2 text-xs leading-snug text-foreground shadow-lg",
        "dark:border-white/10 dark:bg-[#0f1729]",
        className
      )}
    >
      {children}
    </span>
  );
}
