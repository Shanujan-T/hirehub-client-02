"use client";

import Link from "next/link";
import { useCallback } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { ContractProgressBar } from "@/components/contract-progress-bar";
import { PortalShell, memberNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getContracts } from "@/services/contract";

export default function MemberDashboardPage() {
  const { data: contracts, loading } = useAsyncList(useCallback(() => getContracts(), []));

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <PortalShell title="Member Dashboard" subtitle="Applications, assignments, and earnings" navItems={memberNav}>
        {loading ? <LoadingState /> : contracts.length === 0 ? (
          <EmptyState title="No contracts yet" description="Join a community and apply to internal contracts." />
        ) : (
          contracts.slice(0, 5).map((c) => (
            <Card key={c.id} className="mb-3">
              <div className="mb-3 flex justify-between gap-3">
                <Link href={`/member/contracts/${c.id}`} className="font-bold hover:text-info">{c.job?.title ?? `#${c.id}`}</Link>
                <StatusBadge status={c.status} kind="contract" />
              </div>
              <ContractProgressBar status={c.status} />
            </Card>
          ))
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
