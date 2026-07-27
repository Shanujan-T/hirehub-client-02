"use client";

import Link from "next/link";
import { useCallback } from "react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, memberNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getErrorMessage } from "@/lib/utils";
import { applyToContract, getContracts } from "@/services/contract";

export default function MemberContractsPage() {
  const { data: contracts, loading } = useAsyncList(useCallback(() => getContracts(), []));

  const handleApply = async (contractId: number) => {
    try {
      await applyToContract(contractId);
      toast.success("Applied via contract_application");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <PortalShell title="Contracts" subtitle="Apply to open internal contracts — no employer info shown" navItems={memberNav}>
        {loading ? <LoadingState /> : contracts.length === 0 ? (
          <EmptyState title="No contracts" />
        ) : (
          contracts.map((c) => (
            <Card key={c.id} className="mb-3">
              <div className="flex justify-between gap-3">
                <div>
                  <h3 className="font-bold">{c.job?.title ?? `Contract #${c.id}`}</h3>
                  <p className="text-sm text-muted">{c.job?.description?.slice(0, 120)}…</p>
                </div>
                <StatusBadge status={c.status} kind="contract" />
              </div>
              <div className="mt-3 flex gap-2">
                {c.status === "open_internally" && (
                  <Button variant="gradient" size="sm" className="rounded-full" onClick={() => handleApply(c.id)}>Apply</Button>
                )}
                {c.status === "active" && (
                  <Link href={`/member/contracts/${c.id}`}><Button variant="outline" size="sm">View & Submit</Button></Link>
                )}
              </div>
            </Card>
          ))
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
