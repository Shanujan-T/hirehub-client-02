"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { ContractMessagesPanel } from "@/components/contract-messages-panel";
import { PortalShell, clientNav } from "@/components/portal-shell";
import { LoadingState } from "@/components/page-states";
import { useAsyncItem } from "@/lib/hooks/use-async";
import { getContract } from "@/services/contract";
import { useCallback } from "react";

function ClientContractMessagesContent() {
  const params = useParams();
  const contractId = Number(params.id);
  const { data: contract, loading } = useAsyncItem(
    useCallback(() => getContract(contractId), [contractId])
  );

  return (
    <AuthenticatedRoute allowedRoles={["client"]}>
      <PortalShell
        title="Contract Messages"
        subtitle={contract?.job?.title ?? `Contract #${contractId}`}
        navItems={clientNav}
        backHref={`/contracts/${contractId}`}
        backLabel="Back to contract"
      >
        {loading ? <LoadingState /> : <ContractMessagesPanel contractId={contractId} />}
      </PortalShell>
    </AuthenticatedRoute>
  );
}

export default function ClientContractMessagesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ClientContractMessagesContent />
    </Suspense>
  );
}
