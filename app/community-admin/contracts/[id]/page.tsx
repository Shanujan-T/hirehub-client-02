"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { CommunityAdminRoute } from "@/components/community-admin-route";
import { ContractProgressBar } from "@/components/contract-progress-bar";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncItem } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { getContract } from "@/services/contract";

function ContractDetailContent() {
  const params = useParams();
  const contractId = Number(params.id);
  const { hrefWithReturn } = useListNavigation();
  const { data: contract, loading } = useAsyncItem(useCallback(() => getContract(contractId), [contractId]));

  return (
    <CommunityAdminRoute>
      <PortalShell
        title="Contract Details"
        navItems={communityAdminNav}
        backHref="/community-admin/contracts"
        backLabel="Back to contracts"
      >
        {loading || !contract ? (
          <LoadingState />
        ) : (
          <Card className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-bold">{contract.job?.title ?? `Contract #${contract.id}`}</h2>
              <StatusBadge status={contract.status} kind="contract" />
            </div>
            <ContractProgressBar status={contract.status} />
            <p className="text-sm text-muted">${contract.total_amount} · commission {contract.commission_percent}%</p>
            {contract.deliverable_url && (
              <a href={contract.deliverable_url} className="text-sm text-info underline" target="_blank" rel="noreferrer">
                View deliverable
              </a>
            )}
            <div className="flex flex-wrap gap-2 pt-2">
              {contract.status === "open_internally" && (
                <Link href={hrefWithReturn(`/community-admin/contracts/${contract.id}/applicants`)}>
                  <Button variant="gradient" size="sm" className="rounded-full">Assign Member</Button>
                </Link>
              )}
              {contract.status === "submitted" && (
                <Link href={hrefWithReturn(`/community-admin/contracts/${contract.id}/review`)}>
                  <Button variant="gradient" size="sm" className="rounded-full">Review Deliverable</Button>
                </Link>
              )}
            </div>
          </Card>
        )}
      </PortalShell>
    </CommunityAdminRoute>
  );
}

export default function CommunityAdminContractDetailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ContractDetailContent />
    </Suspense>
  );
}
