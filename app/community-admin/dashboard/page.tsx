"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { Card } from "@/components/ui";
import { getContracts } from "@/services/contract";
import { getJobs } from "@/services/job";
import type { Contract } from "@/types/contract";
import type { Job } from "@/types/job";

export default function CommunityAdminDashboardPage() {
  const { communityId } = useCommunityAdmin();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    getJobs().then(setJobs).catch(console.error);
    getContracts().then(setContracts).catch(console.error);
  }, []);

  return (
    <CommunityAdminRoute>
      <PortalShell title="Community Admin" subtitle="Manage jobs, contracts, and members" navItems={communityAdminNav}>
        {communityId && (
          <Card className="mb-6 border-secondary/20 bg-secondary/5">
            <p className="text-sm text-muted">Community ID: <span className="font-bold text-secondary">{communityId}</span></p>
          </Card>
        )}
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 font-extrabold">Open Jobs</h2>
            {jobs.filter((j) => j.status === "open").slice(0, 3).map((job) => (
              <Card key={job.id} className="mb-2 flex justify-between">
                <Link href="/community-admin/jobs" className="font-medium hover:text-info">{job.title}</Link>
                <StatusBadge status={job.status} kind="job" />
              </Card>
            ))}
          </div>
          <div>
            <h2 className="mb-3 font-extrabold">Contracts</h2>
            {contracts.slice(0, 3).map((c) => (
              <Card key={c.id} className="mb-2 flex justify-between">
                <Link href="/community-admin/contracts" className="font-medium hover:text-info">{c.job?.title ?? `#${c.id}`}</Link>
                <StatusBadge status={c.status} kind="contract" />
              </Card>
            ))}
          </div>
        </div>
      </PortalShell>
    </CommunityAdminRoute>
  );
}
