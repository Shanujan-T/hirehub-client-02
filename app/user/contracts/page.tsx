"use client";

import Link from "next/link";
import { Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { getErrorMessage } from "@/lib/utils";
import { posterApproveDeliverable, getContracts, getContractsNeedingAttention } from "@/services/contract";

function ContractsListContent() {
  const { hrefWithReturn } = useListNavigation();
  const searchParams = useSearchParams();
  const attentionOnly = searchParams.get("attention") === "1";
  const { data: contracts, loading, reload } = useAsyncList(
    useCallback(
      () =>
        attentionOnly
          ? getContractsNeedingAttention().then((d) => d.contracts)
          : getContracts(),
      [attentionOnly]
    )
  );

  const visible = contracts;

  const handleApprove = async (contractId: number) => {
    try {
      await posterApproveDeliverable(contractId);
      toast.success("Deliverable approved. Payment released.");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to approve"));
    }
  };

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell
        title={attentionOnly ? "Needs Attention" : "My Contracts"}
        subtitle={
          attentionOnly
            ? "Contracts flagged by the health monitor"
            : "Review deliverables and release payment"
        }
        actions={
          attentionOnly ? (
            <Link href="/user/contracts">
              <Button variant="outline" size="sm">
                All contracts
              </Button>
            </Link>
          ) : undefined
        }
      >
        {loading ? (
          <LoadingState />
        ) : visible.length === 0 ? (
          <EmptyState
            title={attentionOnly ? "No at-risk contracts" : "No contracts yet"}
            description={attentionOnly ? "Nothing needs attention right now." : undefined}
          />
        ) : (
          visible.map((c) => (
            <Card key={c.id} className="mb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link
                    href={hrefWithReturn(`/user/contracts/${c.id}`)}
                    className="font-bold hover:text-info"
                  >
                    {c.job?.title ?? `Contract #${c.id}`}
                  </Link>
                  <p className="text-sm text-muted">
                    {c.community?.name} · ${c.total_amount}
                  </p>
                  {(c.risk_level === "low" || c.risk_level === "high") && c.risk_reason && (
                    <p className="mt-1 text-sm text-amber-800 dark:text-amber-200">
                      ⚠ {c.risk_reason}
                    </p>
                  )}
                  {c.deliverable_url && (
                    <a
                      href={c.deliverable_url}
                      className="text-sm text-info underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Deliverable
                    </a>
                  )}
                </div>
                <StatusBadge status={c.status} kind="contract" />
              </div>
              <div className="mt-3 flex gap-2">
                <Link href={hrefWithReturn(`/user/contracts/${c.id}`)}>
                  <Button variant="outline" size="sm">
                    View Contract
                  </Button>
                </Link>
                {c.status === "submitted" && (
                  <Button
                    variant="gradient"
                    size="sm"
                    className="rounded-full"
                    onClick={() => void handleApprove(c.id)}
                  >
                    Approve & Pay
                  </Button>
                )}
                {c.status === "completed" && (
                  <Link href={hrefWithReturn(`/user/reviews/${c.id}`)}>
                    <Button variant="outline" size="sm">
                      Leave Review
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))
        )}
      </DashboardPortalShell>
    </AuthenticatedRoute>
  );
}

export default function ContractsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ContractsListContent />
    </Suspense>
  );
}
