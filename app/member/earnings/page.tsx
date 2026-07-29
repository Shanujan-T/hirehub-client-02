"use client";

import { useCallback } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { DashboardPortalShell } from "@/components/portal-shell";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getMyEarnings } from "@/services/contract";

export default function MemberEarningsPage() {
  const { data: payments, loading } = useAsyncList(useCallback(() => getMyEarnings(), []));

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell title="My Earnings" subtitle="Member payout history (payment)">
        {loading ? <LoadingState /> : payments.length === 0 ? (
          <EmptyState title="No payouts yet" />
        ) : (
          payments.map((p) => (
            <Card key={p.id} className="mb-2">
              <p className="text-sm text-muted">Contract #{p.contract_id}</p>
              <p className="text-2xl font-extrabold text-info">${p.member_payout}</p>
              <p className="text-xs capitalize text-muted">{p.status}</p>
            </Card>
          ))
        )}
      </DashboardPortalShell>
    </AuthenticatedRoute>
  );
}
