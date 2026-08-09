"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { NeedsAttentionBanner } from "@/components/needs-attention-banner";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui";
import { getCommunity } from "@/services/community";
import { getContracts } from "@/services/contract";
import { getMarketplaceJobs } from "@/services/job";
import type { Community } from "@/types/community";
import type { Contract } from "@/types/contract";
import type { Job } from "@/types/job";

export default function CommunityAdminDashboardPage() {
  const { communityId } = useCommunityAdmin();
  const [community, setCommunity] = useState<Community | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    getMarketplaceJobs().then(setJobs).catch(console.error);
    getContracts().then(setContracts).catch(console.error);
  }, []);

  useEffect(() => {
    if (!communityId) return;
    getCommunity(communityId).then(setCommunity).catch(console.error);
  }, [communityId]);

  return (
    <CommunityAdminRoute>
      <DashboardPortalShell title="Community Admin" subtitle="Manage jobs, contracts, and members">
        <NeedsAttentionBanner contractsHref="/employer/community-admin/contracts" />
        {community && (
          <Card className="mb-6 border-secondary/20 bg-secondary/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold text-secondary">{community.name}</p>
                {community.rejection_reason && community.status === "rejected" && (
                  <p className="mt-1 text-sm text-destructive">{community.rejection_reason}</p>
                )}
              </div>
              <StatusBadge status={community.status} kind="community" />
            </div>
            {community.status === "pending" && (
              <p className="mt-2 text-sm text-muted">
                Pending Verification — an admin will review your community shortly.
              </p>
            )}
          </Card>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 font-extrabold">Open Jobs</h2>
            {jobs.filter((j) => j.status === "open").slice(0, 3).map((job) => (
              <Card key={job.id} className="mb-2 flex justify-between">
                <Link href="/employer/community-admin/jobs" className="font-medium hover:text-info">{job.title}</Link>
                <StatusBadge status={job.status} kind="job" />
              </Card>
            ))}
          </div>

          <div>
            <h2 className="mb-3 font-extrabold">Contracts</h2>
            {contracts.slice(0, 3).map((c) => (
              <Card key={c.id} className="mb-2 flex justify-between">
                <Link href="/employer/community-admin/contracts" className="font-medium hover:text-info">
                  {c.job?.title ?? `#${c.id}`}
                </Link>
                <StatusBadge status={c.status} kind="contract" />
              </Card>
            ))}
          </div>
        </div>
      </DashboardPortalShell>
    </CommunityAdminRoute>
  );
}
