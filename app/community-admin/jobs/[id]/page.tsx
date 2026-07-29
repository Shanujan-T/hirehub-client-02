"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { LoadingState } from "@/components/page-states";
import { Badge, Button, Card } from "@/components/ui";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { buildFilteredPath } from "@/lib/navigation";
import { getCommunity } from "@/services/community";
import { getJob } from "@/services/job";
import type { CommunityStatus } from "@/types/community";
import type { Job } from "@/types/job";

function formatDeadline(value: string) {
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function formatPostedAgo(value: string) {
  const created = new Date(value);
  const days = Math.floor((Date.now() - created.getTime()) / (1000 * 60 * 60 * 24));
  if (Number.isNaN(days) || days < 0) return null;
  if (days === 0) return "Posted today";
  if (days === 1) return "Posted 1 day ago";
  return `Posted ${days} days ago`;
}

function JobDetailContent() {
  const params = useParams();
  const jobId = Number(params.id);
  const { communityId } = useCommunityAdmin();
  const { hrefWithReturn } = useListNavigation();
  const [job, setJob] = useState<Job | null>(null);
  const [communityStatus, setCommunityStatus] = useState<CommunityStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const jobsListFallback = buildFilteredPath("/community-admin/jobs", {});

  useEffect(() => {
    getJob(jobId)
      .then(setJob)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [jobId]);

  useEffect(() => {
    if (!communityId) return;
    getCommunity(communityId)
      .then((community) => setCommunityStatus(community.status))
      .catch(() => setCommunityStatus(null));
  }, [communityId]);

  const canApply = job?.status === "open" && communityStatus === "approved";

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
          <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
            <h2 className="text-xl font-bold">{job.title}</h2>
            <div className="flex flex-wrap items-center gap-2">
              {job.category?.name && <Badge variant="info">{job.category.name}</Badge>}
              <StatusBadge status={job.status} kind="job" />
            </div>
          </div>
          <p className="text-sm text-muted">{job.location} · Asking price ${job.final_price}</p>
          <p className="text-sm text-muted">Due by {formatDeadline(job.deadline)}</p>
          {job.suggested_price != null && (
            <p className="text-sm text-muted">Suggested: ${job.suggested_price}</p>
          )}
          {(() => {
            const postedAgo = formatPostedAgo(job.created_at);
            return postedAgo ? <p className="text-xs text-muted">{postedAgo}</p> : null;
          })()}
          <p className="mt-4">{job.description}</p>
          {job.status === "open" && communityId && (
            canApply ? (
              <Link href={hrefWithReturn(`/community-admin/jobs/${jobId}/apply`)} className="mt-4 inline-block">
                <Button variant="gradient" className="rounded-full">
                  Submit Bid
                </Button>
              </Link>
            ) : (
              <div className="mt-4 space-y-2">
                <Button variant="gradient" className="rounded-full" disabled title="Community must be approved">
                  Submit Bid
                </Button>
                <p className="text-xs text-muted">
                  Your community must be approved before applying to jobs.
                  {communityStatus && communityStatus !== "approved" && (
                    <> Current status: {communityStatus.replace(/_/g, " ")}.</>
                  )}
                </p>
              </div>
            )
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
