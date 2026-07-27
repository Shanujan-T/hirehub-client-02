"use client";

import Link from "next/link";
import { useCallback } from "react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, employerNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getErrorMessage } from "@/lib/utils";
import { employerApproveDeliverable, getContracts } from "@/services/contract";

export default function ContractsPage() {
  const { data: contracts, loading, reload } = useAsyncList(useCallback(() => getContracts(), []));

  const handleApprove = async (contractId: number) => {
    try {
      await employerApproveDeliverable(contractId);
      toast.success("Deliverable approved. Payment released.");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to approve"));
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalShell title="My Contracts" subtitle="Review deliverables and release payment" navItems={employerNav}>
        {loading ? <LoadingState /> : contracts.length === 0 ? (
          <EmptyState title="No contracts yet" />
        ) : (
          contracts.map((c) => (
            <Card key={c.id} className="mb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={`/contracts/${c.id}`} className="font-bold hover:text-info">{c.job?.title ?? `Contract #${c.id}`}</Link>
                  <p className="text-sm text-muted">{c.community?.name} · ${c.total_amount}</p>
                  {c.deliverable_url && (
                    <a href={c.deliverable_url} className="text-sm text-info underline" target="_blank" rel="noreferrer">View Deliverable</a>
                  )}
                </div>
                <StatusBadge status={c.status} kind="contract" />
              </div>
              <div className="mt-3 flex gap-2">
                <Link href={`/contracts/${c.id}`}><Button variant="outline" size="sm">View Contract</Button></Link>
                {c.status === "submitted" && (
                  <Button variant="gradient" size="sm" className="rounded-full" onClick={() => handleApprove(c.id)}>Approve & Pay</Button>
                )}
                {c.status === "completed" && (
                  <Link href={`/reviews/${c.id}`}><Button variant="outline" size="sm">Leave Review</Button></Link>
                )}
              </div>
            </Card>
          ))
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
