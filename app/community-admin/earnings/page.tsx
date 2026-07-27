"use client";

import { useEffect, useState } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Card } from "@/components/ui";
import { getMyEarnings } from "@/services/contract";
import type { Payment } from "@/types/contract";

export default function CommunityAdminEarningsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    getMyEarnings().then(setPayments).catch(console.error);
  }, []);

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Earnings</h1>
          <p className="text-muted">Commission history from completed contracts</p>
        </div>
        {payments.map((p) => (
          <Card key={p.id}>
            <p>Contract #{p.contract_id}</p>
            <p className="text-sm text-muted">
              Commission: ${p.commission_amount} · Member payout: ${p.member_payout}
            </p>
            <p className="text-xs">{p.status} · {p.released_at}</p>
          </Card>
        ))}
      </div>
    </AuthenticatedRoute>
  );
}
