"use client";

import { CommunityAdminRoute } from "@/components/community-admin-route";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getMyEarnings } from "@/services/contract";
import { useCallback } from "react";

export default function CommunityAdminEarningsPage() {
  const { data: payments, loading } = useAsyncList(useCallback(() => getMyEarnings(), []));

  return (
    <CommunityAdminRoute>
      <PortalShell title="Earnings" subtitle="Admin commission from payment splits" navItems={communityAdminNav}>
        {loading ? <LoadingState /> : payments.length === 0 ? (
          <EmptyState title="No payments yet" description="Commissions appear when contracts complete." />
        ) : (
          payments.map((p) => (
            <Card key={p.id} className="mb-2 flex justify-between">
              <span>Contract #{p.contract_id}</span>
              <span className="font-bold text-secondary">${p.commission_amount}</span>
            </Card>
          ))
        )}
      </PortalShell>
    </CommunityAdminRoute>
  );
}
