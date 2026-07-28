"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleDollarSign, FileCheck, FileText, Send } from "lucide-react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { ContractProgressBar } from "@/components/contract-progress-bar";
import { PortalShell, memberNav } from "@/components/portal-shell";
import { StatCard, StatCardGrid, DashboardPanel } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/dashboard-stats";
import { useAuth } from "@/providers/auth-provider";
import {
  getContracts,
  getMyContractApplications,
  getMyEarnings,
} from "@/services/contract";
import type { Contract } from "@/types/contract";

export default function MemberDashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [applicationsSent, setApplicationsSent] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [contractRows, applicationRows, paymentRows] = await Promise.all([
        getContracts(),
        getMyContractApplications(),
        getMyEarnings(),
      ]);
      setContracts(contractRows);
      setApplicationsSent(applicationRows.length);
      setTotalEarned(
        paymentRows
          .filter((payment) => payment.status === "released")
          .reduce((sum, payment) => sum + Number(payment.member_payout), 0)
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const assignedContracts = useMemo(
    () => contracts.filter((contract) => contract.assigned_member_id === user?.id),
    [contracts, user?.id]
  );

  const stats = useMemo(() => {
    const completed = assignedContracts.filter((contract) => contract.status === "completed").length;
    const assignedActive = assignedContracts.filter((contract) => contract.status !== "completed").length;
    return {
      applicationsSent,
      assignedContracts: assignedActive,
      completedContracts: completed,
      totalEarned,
    };
  }, [applicationsSent, assignedContracts, totalEarned]);

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <PortalShell title="Member Dashboard" subtitle="Applications, assignments, and earnings" navItems={memberNav}>
        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-8">
            <StatCardGrid>
              <StatCard label="Applications Sent" value={stats.applicationsSent} icon={Send} iconClassName="bg-gradient-to-br from-info to-primary" />
              <StatCard label="Assigned Contracts" value={stats.assignedContracts} icon={FileText} iconClassName="bg-brand-gradient" />
              <StatCard label="Completed Contracts" value={stats.completedContracts} icon={FileCheck} iconClassName="bg-gradient-to-br from-secondary to-accent" />
              <StatCard label="Total Earned" value={formatCurrency(stats.totalEarned)} icon={CircleDollarSign} iconClassName="bg-gradient-to-br from-primary to-secondary" />
            </StatCardGrid>

            <DashboardPanel title="Your contracts" subtitle="Assignments and progress">
              {assignedContracts.length === 0 ? (
                <EmptyState title="No contracts yet" description="Join a community and apply to internal contracts." />
              ) : (
                <div className="grid gap-4">
                  {assignedContracts.slice(0, 5).map((contract) => (
                    <Card key={contract.id} className="p-4 shadow-none">
                      <div className="mb-3 flex justify-between gap-3">
                        <Link href={`/member/contracts/${contract.id}`} className="font-bold hover:text-info">
                          {contract.job?.title ?? `#${contract.id}`}
                        </Link>
                        <StatusBadge status={contract.status} kind="contract" />
                      </div>
                      <ContractProgressBar status={contract.status} />
                    </Card>
                  ))}
                  {assignedContracts.length > 5 && (
                    <Link href="/member/contracts" className="text-sm font-semibold text-info hover:underline">
                      View all contracts →
                    </Link>
                  )}
                </div>
              )}
            </DashboardPanel>
          </div>
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
