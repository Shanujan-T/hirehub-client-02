"use client";

import Link from "next/link";
import { Suspense, useCallback } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { getMyJobs } from "@/services/job";

function JobsListContent() {
  const { hrefWithReturn } = useListNavigation();
  const { data: jobs, loading } = useAsyncList(useCallback(() => getMyJobs(), []));

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell
        title="My Jobs"
        subtitle="Jobs posted by you"
        actions={
          <Link href="/jobs/new">
            <Button variant="gradient" size="sm" className="rounded-full">
              Post a Job
            </Button>
          </Link>
        }
      >
        {loading ? <LoadingState /> : jobs.length === 0 ? (
          <EmptyState title="No jobs" description="Post a job for communities to apply." />
        ) : (
          jobs.map((job) => (
            <Card key={job.id} className="mb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link href={hrefWithReturn(`/jobs/${job.id}`)} className="text-lg font-bold hover:text-info">
                    {job.title}
                  </Link>
                  <p className="text-sm text-muted">{job.location} · ${job.final_price}</p>
                </div>
                <StatusBadge status={job.status} kind="job" />
              </div>
              <div className="mt-3 flex gap-2">
                <Link href={hrefWithReturn(`/jobs/${job.id}`)}>
                  <Button variant="outline" size="sm">
                    Details
                  </Button>
                </Link>
                {job.status === "open" && (
                  <Link href={hrefWithReturn(`/jobs/${job.id}/applicants`)}>
                    <Button variant="gradient" size="sm" className="rounded-full">
                      Applicants
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          ))
        )}
      </DashboardPortalShell>
    </AuthenticatedRoute>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <JobsListContent />
    </Suspense>
  );
}
