"use client";

import Link from "next/link";
import { Briefcase, CircleDollarSign, FileCheck, FileText, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CommunityAvatar } from "@/components/community-avatar";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { NeedsAttentionBanner } from "@/components/needs-attention-banner";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatCard, StatCardGrid, DashboardPanel } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { ACTIVE_CONTRACT_STATUSES, formatCurrency } from "@/lib/dashboard-stats";
import { getContracts, getPayments } from "@/services/contract";
import { getMyJobs } from "@/services/job";
import type { Contract } from "@/types/contract";
import type { Job } from "@/types/job";

export default function ClientDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [jobRows, contractRows, paymentRows] = await Promise.all([
        getMyJobs(),
        getContracts(),
        getPayments(),
      ]);
      setJobs(jobRows);
      setContracts(contractRows);
      setTotalSpent(
        paymentRows
          .filter((payment) => payment.status === "released")
          .reduce((sum, payment) => sum + Number(payment.total_amount), 0)
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const activeContracts = contracts.filter((contract) =>
      ACTIVE_CONTRACT_STATUSES.has(contract.status)
    ).length;
    const completedContracts = contracts.filter((contract) => contract.status === "completed").length;
    return {
      jobsPosted: jobs.length,
      activeContracts,
      completedContracts,
      totalSpent,
    };
  }, [contracts, jobs.length, totalSpent]);

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell
        title="Dashboard"
        subtitle="Post jobs, manage contracts, and track your communities"
        actions={
          <Link href="/user/jobs/new">
            <Button variant="gradient" size="sm" className="rounded-full">
              <Plus className="mr-1 h-4 w-4" />
              Post Job
            </Button>
          </Link>
        }
      >
        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-8">
            <NeedsAttentionBanner contractsHref="/user/contracts" />
            <StatCardGrid>
              <StatCard label="Jobs Posted" value={stats.jobsPosted} icon={Briefcase} iconClassName="bg-brand-gradient" />
              <StatCard label="Active Contracts" value={stats.activeContracts} icon={FileText} iconClassName="bg-gradient-to-br from-info to-primary" />
              <StatCard label="Completed Contracts" value={stats.completedContracts} icon={FileCheck} iconClassName="bg-gradient-to-br from-secondary to-accent" />
              <StatCard label="Total Spent" value={formatCurrency(stats.totalSpent)} icon={CircleDollarSign} iconClassName="bg-gradient-to-br from-primary to-secondary" />
            </StatCardGrid>

            <DashboardPanel title="Recent jobs & contracts" subtitle="Latest postings and active work">
              {jobs.length === 0 && contracts.length === 0 ? (
                <EmptyState title="No jobs yet" description="Post your first job for communities to apply." />
              ) : (
                <div className="grid gap-3">
                  {jobs.slice(0, 5).map((job) => (
                    <Card key={job.id} className="p-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <Link href={`/user/jobs/${job.id}`} className="font-bold text-primary hover:text-info dark:text-foreground">
                            {job.title}
                          </Link>
                          <p className="text-sm text-muted">
                            {job.location} · {formatCurrency(job.final_price)}
                            {" · "}
                            {(job.application_count ?? 0) === 0
                              ? "No communities applied"
                              : (job.application_count ?? 0) === 1
                                ? "1 community applied"
                                : `${job.application_count} communities applied`}
                          </p>
                        </div>
                        <StatusBadge status={job.status} kind="job" />
                      </div>
                      {job.status === "open" && (
                        <Link href={`/user/jobs/${job.id}/applicants`} className="mt-2 inline-block">
                          <Button variant="gradient" size="sm" className="rounded-full">
                            View Applicants
                          </Button>
                        </Link>
                      )}
                    </Card>
                  ))}

                  {contracts.slice(0, 3).map((contract) => (
                    <Card key={contract.id} className="p-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          {contract.community && (
                            <CommunityAvatar
                              name={contract.community.name}
                              imageUrl={contract.community.image_url}
                              size="sm"
                            />
                          )}
                          <div>
                            <Link href={`/user/contracts/${contract.id}`} className="font-bold hover:text-info">
                              {contract.job?.title ?? `Contract #${contract.id}`}
                            </Link>
                            <p className="text-sm text-muted">
                              {contract.community?.name ?? `Community #${contract.community_id}`}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={contract.status} kind="contract" />
                      </div>
                    </Card>
                  ))}

                  <Link href="/user/jobs">
                    <Button variant="ghost">View all jobs →</Button>
                  </Link>
                </div>
              )}
            </DashboardPanel>
          </div>
        )}
      </DashboardPortalShell>
    </AuthenticatedRoute>
  );
}
