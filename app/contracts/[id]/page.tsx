"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { CommunityAvatar } from "@/components/community-avatar";
import { ContractProgressBar } from "@/components/contract-progress-bar";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { getContract } from "@/services/contract";
import type { Contract } from "@/types/contract";

function ContractDetailContent() {
  const params = useParams();
  const contractId = Number(params.id);
  const { hrefWithReturn } = useListNavigation();
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getContract(contractId).then(setContract).finally(() => setLoading(false));
  }, [contractId]);

  useEffect(() => { load(); }, [load]);

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell title="Contract Details" backHref="/contracts" backLabel="Back to contracts">
        {loading || !contract ? <LoadingState /> : (
          <Card>
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-xl font-bold">{contract.job?.title ?? `Contract #${contract.id}`}</h2>
              <StatusBadge status={contract.status} kind="contract" />
            </div>
            <ContractProgressBar status={contract.status} />
            <div className="mt-4 flex items-center gap-3">
              {contract.community && (
                <CommunityAvatar
                  name={contract.community.name}
                  imageUrl={contract.community.image_url}
                  size="sm"
                />
              )}
              <p className="text-sm text-muted">
                {contract.community?.name ?? `Community #${contract.community_id}`} · ${contract.total_amount}
              </p>
            </div>
            <Link href={hrefWithReturn(`/contracts/${contract.id}/messages`)} className="mt-4 inline-block">
              <Button variant="outline" size="sm" className="rounded-full">Messages</Button>
            </Link>
            {contract.deliverable_url && (
              <a href={contract.deliverable_url} className="mt-2 block text-sm text-info underline" target="_blank" rel="noreferrer">
                View Deliverable
              </a>
            )}
            {contract.status === "completed" && (
              <Link href={hrefWithReturn(`/reviews/${contract.id}`)} className="mt-4 inline-block">
                <Button variant="gradient" className="rounded-full">Leave Review</Button>
              </Link>
            )}
          </Card>
        )}
      </DashboardPortalShell>
    </AuthenticatedRoute>
  );
}

export default function ContractDetailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ContractDetailContent />
    </Suspense>
  );
}
