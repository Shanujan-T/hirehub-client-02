"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui";
import { getContractsNeedingAttention } from "@/services/contract";
import type { Contract } from "@/types/contract";

export function NeedsAttentionBanner({
  contractsHref,
}: {
  /** Base path for filtered contracts list, e.g. /contracts or /community-admin/contracts */
  contractsHref: string;
}) {
  const [count, setCount] = useState(0);
  const [preview, setPreview] = useState<Contract[]>([]);

  useEffect(() => {
    getContractsNeedingAttention()
      .then((data) => {
        setCount(data.count);
        setPreview(data.contracts.slice(0, 3));
      })
      .catch(() => {
        setCount(0);
        setPreview([]);
      });
  }, []);

  if (count <= 0) return null;

  const href = `${contractsHref}?attention=1`;

  return (
    <Card className="mb-6 border-amber-500/40 bg-amber-500/10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 font-extrabold text-amber-800 dark:text-amber-200">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden />
            Needs Attention
          </p>
          <p className="mt-1 text-sm text-amber-900/80 dark:text-amber-100/80">
            {count} contract{count === 1 ? "" : "s"} need
            {count === 1 ? "s" : ""} attention
          </p>
          {preview.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-muted">
              {preview.map((c) => (
                <li key={c.id} className="truncate">
                  <span className="font-medium text-foreground">
                    {c.job?.title ?? `Contract #${c.id}`}
                  </span>
                  {c.risk_reason ? ` — ${c.risk_reason}` : ""}
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link
          href={href}
          className="shrink-0 rounded-full border border-amber-600/40 bg-background/60 px-3 py-1.5 text-sm font-semibold text-amber-900 hover:bg-background dark:text-amber-100"
        >
          View at-risk
        </Link>
      </div>
    </Card>
  );
}
