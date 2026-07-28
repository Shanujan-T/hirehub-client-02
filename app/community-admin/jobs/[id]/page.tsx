"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { buildFilteredPath } from "@/lib/navigation";
import { getErrorMessage } from "@/lib/utils";
import { applyToJob, getJob } from "@/services/job";
import type { Job } from "@/types/job";

function JobDetailContent() {
  const params = useParams();
  const jobId = Number(params.id);
  const { communityId } = useCommunityAdmin();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const jobsListFallback = buildFilteredPath("/community-admin/jobs", {});

  useEffect(() => {
    getJob(jobId)
      .then(setJob)
      .catch(() => toast.error("Failed to load job"))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleApply = async () => {
    if (!communityId) return;
    try {
      await applyToJob(jobId, communityId);
      toast.success("Applied on behalf of community");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <PortalShell
      title="Job Details"
      navItems={communityAdminNav}
      backHref={jobsListFallback}
      backLabel="Back to jobs"
    >
      {loading || !job ? (
        <LoadingState />
      ) : (
        <Card>
          <div className="mb-4 flex items-start justify-between">
            <h2 className="text-xl font-bold">{job.title}</h2>
            <StatusBadge status={job.status} kind="job" />
          </div>
          <p className="text-sm text-muted">{job.location} · ${job.final_price}</p>
          {job.suggested_price != null && (
            <p className="text-sm text-muted">Suggested: ${job.suggested_price}</p>
          )}
          <p className="mt-4">{job.description}</p>
          {job.status === "open" && (
            <Button variant="gradient" className="mt-4 rounded-full" onClick={handleApply}>
              Apply as Community
            </Button>
          )}
        </Card>
      )}
    </PortalShell>
  );
}

export default function CommunityAdminJobDetailPage() {
  return (
    <CommunityAdminRoute>
      <Suspense fallback={<LoadingState />}>
        <JobDetailContent />
      </Suspense>
    </CommunityAdminRoute>
  );
}
