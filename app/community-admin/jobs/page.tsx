"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card, Input, Label } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { getMarketplaceJobs } from "@/services/job";
import { useCallback } from "react";

function JobsBrowseContent() {
  const { communityId } = useCommunityAdmin();
  const { hrefWithReturn, setFilter, getFilter } = useListNavigation();
  const locationFilter = getFilter("location");
  const queryFilter = getFilter("q");
  const { data: jobs, loading } = useAsyncList(useCallback(() => getMarketplaceJobs(), []));

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      if (locationFilter && !job.location.toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
      if (queryFilter) {
        const q = queryFilter.toLowerCase();
        return job.title.toLowerCase().includes(q) || job.description.toLowerCase().includes(q);
      }
      return true;
    });
  }, [jobs, locationFilter, queryFilter]);

  return (
    <PortalShell title="Browse Jobs" subtitle="Submit a bid for open jobs" navItems={communityAdminNav}>
      <Card className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="job-q">Search</Label>
          <Input
            id="job-q"
            placeholder="Title or description"
            value={queryFilter}
            onChange={(e) => setFilter("q", e.target.value || null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="job-location">Location</Label>
          <Input
            id="job-location"
            placeholder="City or area"
            value={locationFilter}
            onChange={(e) => setFilter("location", e.target.value || null)}
          />
        </div>
      </Card>
      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState title="No jobs available" description="Try adjusting your filters." />
      ) : (
        filtered.map((job) => (
          <Card key={job.id} className="mb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link href={hrefWithReturn(`/community-admin/jobs/${job.id}`)} className="font-bold hover:text-info">
                  {job.title}
                </Link>
                <p className="text-sm text-muted">{job.location} · Asking price ${job.final_price}</p>
              </div>
              <StatusBadge status={job.status} kind="job" />
            </div>
            <p className="mt-2 text-sm text-muted">{job.description.slice(0, 160)}…</p>
            {job.status === "open" && communityId && (
              <Link href={hrefWithReturn(`/community-admin/jobs/${job.id}/apply`)} className="mt-3 inline-block">
                <Button variant="gradient" className="rounded-full">
                  Submit Bid
                </Button>
              </Link>
            )}
          </Card>
        ))
      )}
    </PortalShell>
  );
}

export default function CommunityAdminJobsPage() {
  return (
    <CommunityAdminRoute>
      <Suspense fallback={<LoadingState />}>
        <JobsBrowseContent />
      </Suspense>
    </CommunityAdminRoute>
  );
}
