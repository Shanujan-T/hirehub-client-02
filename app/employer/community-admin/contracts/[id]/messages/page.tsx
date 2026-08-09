"use client";

import { Suspense, useCallback } from "react";
import { useParams } from "next/navigation";
import { CommunityAdminRoute } from "@/components/community-admin-route";
import { ContractMessagesPanel } from "@/components/contract-messages-panel";
import { DashboardPortalShell } from "@/components/portal-shell";
import { LoadingState } from "@/components/page-states";
import { useAsyncItem } from "@/lib/hooks/use-async";
import { getContract } from "@/services/contract";

function CommunityAdminContractMessagesContent() {
  const params = useParams();
  const contractId = Number(params.id);
  const { data: contract, loading } = useAsyncItem(
    useCallback(() => getContract(contractId), [contractId])
  );

  return (
    <CommunityAdminRoute>
      <DashboardPortalShell
        title="Contract Messages"
        subtitle={contract?.job?.title ?? `Contract #${contractId}`}
        backHref={`/employer/community-admin/contracts/${contractId}`}
        backLabel="Back to contract"
      >
        {loading ? <LoadingState /> : <ContractMessagesPanel contractId={contractId} />}
      </DashboardPortalShell>
    </CommunityAdminRoute>
  );
}

export default function CommunityAdminContractMessagesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CommunityAdminContractMessagesContent />
    </Suspense>
  );
}
