"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  CircleDollarSign,
  ClipboardList,
  UserRoundCheck,
} from "lucide-react";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button, Card } from "@/components/ui";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { getMyMemberships } from "@/services/community";
import { getContracts, getMyEarnings } from "@/services/contract";
import type { CommunityMember } from "@/types/community";
import type { Contract, Payment } from "@/types/contract";

const quickActions = [
  {
    href: "/employer/communities",
    label: "My Communities",
    detail: "Join or manage a working community",
    icon: Building2,
  },
  {
    href: "/employer/my-contracts",
    label: "My Contracts",
    detail: "Track assigned work and deliverables",
    icon: ClipboardList,
  },
  {
    href: "/employer/earnings",
    label: "Earnings",
    detail: "Review payments for completed work",
    icon: CircleDollarSign,
  },
  {
    href: "/employer/profile#skills",
    label: "Skills Profile",
    detail: "Keep your skills and work samples current",
    icon: UserRoundCheck,
  },
];

function formatLkr(value: number) {
  return `LKR ${value.toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<CommunityMember[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [membershipRows, contractRows, paymentRows] = await Promise.all([
        getMyMemberships(),
        getContracts(),
        getMyEarnings(),
      ]);
      setMemberships(membershipRows);
      setContracts(contractRows);
      setPayments(paymentRows);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load your Employer dashboard."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const approvedMemberships = memberships.filter((membership) => membership.status === "approved");
  const activeContracts = contracts.filter((contract) =>
    ["open_internally", "active", "submitted"].includes(contract.status)
  );
  const releasedEarnings = payments
    .filter((payment) => payment.status === "released")
    .reduce((total, payment) => total + Number(payment.member_payout || 0), 0);
  const recentContracts = useMemo(
    () =>
      [...contracts]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 4),
    [contracts]
  );

  return (
    <DashboardPortalShell
      title={user?.full_name ? `Welcome, ${user.full_name}` : "Employer Dashboard"}
      subtitle="Community membership, contracted work, and earnings"
    >
      {error && (
        <Card className="mb-6 border-destructive/30 bg-destructive/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden />
              <span>{error}</span>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => void loadDashboard()}>
              Try again
            </Button>
          </div>
        </Card>
      )}

      <section aria-label="Employer overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="p-5">
          <Building2 className="h-5 w-5 text-info" aria-hidden />
          <p className="mt-3 text-sm text-muted">Approved communities</p>
          <p className="mt-1 text-3xl font-extrabold text-foreground">{loading ? "—" : approvedMemberships.length}</p>
        </Card>
        <Card className="p-5">
          <ClipboardList className="h-5 w-5 text-secondary" aria-hidden />
          <p className="mt-3 text-sm text-muted">Contracts in progress</p>
          <p className="mt-1 text-3xl font-extrabold text-foreground">{loading ? "—" : activeContracts.length}</p>
        </Card>
        <Card className="p-5 sm:col-span-2 xl:col-span-1">
          <CircleDollarSign className="h-5 w-5 text-success" aria-hidden />
          <p className="mt-3 text-sm text-muted">Released earnings</p>
          <p className="mt-1 text-3xl font-extrabold text-foreground">
            {loading ? "—" : formatLkr(releasedEarnings)}
          </p>
        </Card>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-foreground">Recent contracts</h2>
            <p className="text-sm text-muted">Your latest community work and internal opportunities</p>
          </div>
          <Link href="/employer/my-contracts" className="text-sm font-semibold text-info hover:underline">
            View all
          </Link>
        </div>
        {loading ? (
          <Card className="p-5 text-sm text-muted">Loading your work…</Card>
        ) : recentContracts.length === 0 ? (
          <Card className="p-5">
            <p className="font-semibold text-foreground">No contracts yet</p>
            <p className="mt-1 text-sm text-muted">Join a community to become eligible for work it wins.</p>
            <Link href="/employer/communities" className="mt-3 inline-block text-sm font-semibold text-info hover:underline">
              Browse communities
            </Link>
          </Card>
        ) : (
          <div className="space-y-3">
            {recentContracts.map((contract) => (
              <Link key={contract.id} href={`/employer/my-contracts/${contract.id}`} className="block">
                <Card className="flex items-center justify-between gap-4 p-4 transition hover:border-info">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {contract.job?.title ?? `Contract #${contract.id}`}
                    </p>
                    <p className="mt-1 truncate text-sm text-muted">
                      {contract.community?.name ?? "Community contract"} · {formatLkr(Number(contract.member_payout || 0))}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={contract.status} kind="contract" />
                    <ArrowRight className="h-4 w-4 text-muted" aria-hidden />
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-foreground">Employer tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickActions.map(({ href, label, detail, icon: Icon }) => (
            <Link href={href} key={href}>
              <Card className="h-full p-5 transition hover:border-info">
                <Icon className="mb-3 h-6 w-6 text-info" aria-hidden />
                <h3 className="font-bold text-foreground">{label}</h3>
                <p className="mt-1 text-sm text-muted">{detail}</p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </DashboardPortalShell>
  );
}
