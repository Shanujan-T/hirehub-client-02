"use client";

import type { ScopeDisplayRow } from "@/types/job";

export function JobScopeDisplay({ rows }: { rows?: ScopeDisplayRow[] | null }) {
  if (!rows?.length) return null;
  return (
    <div className="mt-4 space-y-1.5 rounded-xl border border-border/70 bg-background/40 p-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Scope</p>
      <ul className="space-y-1 text-sm text-foreground">
        {rows.map((row) => (
          <li key={row.key}>
            <span className="font-medium">{row.label}:</span> {row.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
