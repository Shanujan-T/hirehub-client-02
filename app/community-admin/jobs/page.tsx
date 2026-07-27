"use client";

import Link from "next/link";
import { toast } from "sonner";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getErrorMessage } from "@/lib/utils";
import { applyToJob, getJobs } from "@/services/job";
import { useCallback } from "react";

export default function CommunityAdminJobsPage() {
  const { communityId } = useCommunityAdmin();
  const { data: jobs, loading } = useAsyncList(useCallback(() => getJobs(), []));

  const handleApply = async (jobId: number) => {
    if (!communityId) return;
    try {
      await applyToJob(jobId, communityId);
      toast.success("Applied on behalf of community");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <CommunityAdminRoute>
      <PortalShell title="Browse Jobs" subtitle="Apply via community_application" navItems={communityAdminNav}>
        {loading ? <LoadingState /> : jobs.length === 0 ? (
          <EmptyState title="No jobs available" />
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="mb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold">{job.title}</h3>
                  <p className="text-sm text-muted">{job.location} · ${job.final_price}</p>
                </div>
                <StatusBadge status={job.status} kind="job" />
              </div>
              <p className="mt-2 text-sm text-muted">{job.description.slice(0, 160)}…</p>
              {job.status === "open" && (
                <Button variant="gradient" className="mt-3 rounded-full" onClick={() => handleApply(job.id)}>Apply as Community</Button>
              )}
            </Card>
          ))
        )}
      </PortalShell>
    </CommunityAdminRoute>
  );
}
