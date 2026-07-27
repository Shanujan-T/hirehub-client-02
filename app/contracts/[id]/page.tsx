"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { ContractProgressBar } from "@/components/contract-progress-bar";
import { PortalShell, employerNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { getContract } from "@/services/contract";
import type { Contract } from "@/types/contract";

export default function ContractDetailPage() {
  const params = useParams();
  const contractId = Number(params.id);
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getContract(contractId).then(setContract).finally(() => setLoading(false));
  }, [contractId]);

  useEffect(() => { load(); }, [load]);

  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalShell title="Contract Details" navItems={employerNav}>
        {loading || !contract ? <LoadingState /> : (
          <Card>
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-xl font-bold">{contract.job?.title ?? `Contract #${contract.id}`}</h2>
              <StatusBadge status={contract.status} kind="contract" />
            </div>
            <ContractProgressBar status={contract.status} />
            <p className="mt-4 text-sm text-muted">{contract.community?.name} · ${contract.total_amount}</p>
            {contract.deliverable_url && (
              <a href={contract.deliverable_url} className="mt-2 block text-sm text-info underline" target="_blank" rel="noreferrer">View Deliverable</a>
            )}
            {contract.status === "completed" && (
              <Link href={`/reviews/${contract.id}`} className="mt-4 inline-block">
                <Button variant="gradient" className="rounded-full">Leave Review</Button>
              </Link>
            )}
          </Card>
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
