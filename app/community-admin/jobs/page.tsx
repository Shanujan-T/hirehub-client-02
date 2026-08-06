"use client";

import Link from "next/link";
import { Suspense, useCallback, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { MatchScoreBadge } from "@/components/match-score-badge";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card, Input, Label } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { getMarketplaceJobs } from "@/services/job";
import { getRecommendedJobs } from "@/services/community";
import { cn } from "@/lib/utils";

function JobsBrowseContent() {
  const { communityId } = useCommunityAdmin();
  const { hrefWithReturn, setFilter, getFilter } = useListNavigation();
  const locationFilter = getFilter("location");
  const queryFilter = getFilter("q");
  const view = getFilter("view", "all");
  const showRecommended = view === "recommended";

  const { data: jobs, loading } = useAsyncList(useCallback(() => getMarketplaceJobs(), []));
  const {
    data: recommendations,
    loading: recLoading,
  } = useAsyncList(
    useCallback(async () => {
      if (!communityId) return [];
      try {
        return await getRecommendedJobs(communityId);
      } catch {
        return [];
      }
    }, [communityId]),
    "Failed to load recommendations"
  );

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
    <DashboardPortalShell title="Browse Jobs" subtitle="Submit a bid for open jobs">
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("view", null)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition",
            !showRecommended
              ? "bg-primary text-white"
              : "border border-border bg-card text-muted hover:text-foreground"
          )}
        >
          All jobs
        </button>
        <button
          type="button"
          onClick={() => setFilter("view", "recommended")}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition",
            showRecommended
              ? "bg-brand-gradient text-white"
              : "border border-border bg-card text-muted hover:text-foreground"
          )}
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          Recommended for Your Community
        </button>
      </div>

      {!showRecommended && (
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
      )}

      {showRecommended ? (
        recLoading ? (
          <LoadingState />
        ) : recommendations.length === 0 ? (
          <EmptyState
            title="No recommendations yet"
            description="Add member skills and set your community location to improve matches."
          />
        ) : (
          <div className="grid gap-3">
            <p className="text-sm text-muted">
              Jobs ranked by skill overlap with your members and location fit.
            </p>
            {recommendations.map((rec) => (
              <Card key={rec.job.id} className="flex gap-4 !p-4">
                <MatchScoreBadge score={rec.match_score} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Link
                        href={hrefWithReturn(`/community-admin/jobs/${rec.job.id}`)}
                        className="font-bold hover:text-info"
                      >
                        {rec.job.title}
                      </Link>
                      <p className="text-sm text-muted">
                        {rec.job.location} · Asking price ${rec.job.final_price}
                      </p>
                    </div>
                    <StatusBadge status={rec.job.status} kind="job" />
                  </div>
                  {rec.ai_blurb ? (
                    <p className="mt-2 text-sm text-foreground">{rec.ai_blurb}</p>
                  ) : (
                    <p className="mt-2 text-sm text-muted">
                      {rec.skill_summary || "Good skill overlap."}
                      {rec.location_match ? " Location match." : ""}
                    </p>
                  )}
                  {rec.job.status === "open" && communityId && (
                    <Link
                      href={hrefWithReturn(`/community-admin/jobs/${rec.job.id}/apply`)}
                      className="mt-3 inline-block"
                    >
                      <Button variant="gradient" className="rounded-full">
                        Submit Bid
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      ) : loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState title="No jobs available" description="Try adjusting your filters." />
      ) : (
        filtered.map((job) => (
          <Card key={job.id} className="mb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Link
                  href={hrefWithReturn(`/community-admin/jobs/${job.id}`)}
                  className="font-bold hover:text-info"
                >
                  {job.title}
                </Link>
                <p className="text-sm text-muted">
                  {job.location} · Asking price ${job.final_price}
                </p>
              </div>
              <StatusBadge status={job.status} kind="job" />
            </div>
            <p className="mt-2 text-sm text-muted">{job.description.slice(0, 160)}…</p>
            {job.status === "open" && communityId && (
              <Link
                href={hrefWithReturn(`/community-admin/jobs/${job.id}/apply`)}
                className="mt-3 inline-block"
              >
                <Button variant="gradient" className="rounded-full">
                  Submit Bid
                </Button>
              </Link>
            )}
          </Card>
        ))
      )}
    </DashboardPortalShell>
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
