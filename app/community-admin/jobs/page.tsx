"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Badge, Button, Card, Input, Label } from "@/components/ui";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { getErrorMessage } from "@/lib/utils";
import { getCommunity, MIN_COMMUNITY_MEMBERS } from "@/services/community";
import {
  getMarketplaceJobs,
  getRecommendedJobs,
  type JobMatchRecommendation,
} from "@/services/job";
import type { Community } from "@/types/community";
import type { Job } from "@/types/job";

function JobsBrowseContent() {
  const { communityId } = useCommunityAdmin();
  const { hrefWithReturn, setFilter, getFilter } = useListNavigation();
  const locationFilter = getFilter("location");
  const queryFilter = getFilter("q");
  const viewFilter = getFilter("view") || "all";

  const [community, setCommunity] = useState<Community | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(true);
  const [blockReason, setBlockReason] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<JobMatchRecommendation[]>([]);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    if (!communityId) {
      setEligibilityLoading(false);
      setBlockReason("Select a community you admin to browse the job marketplace.");
      return;
    }
    let active = true;
    setEligibilityLoading(true);
    getCommunity(communityId)
      .then((data) => {
        if (!active) return;
        setCommunity(data);
        const verified =
          data.verification_status === "verified" || data.status === "approved";
        const memberCount = data.member_count ?? data.members?.length ?? 0;
        if (!verified) {
          setBlockReason(
            "This community isn't verified yet. A platform admin must approve it before you can browse or apply to jobs."
          );
        } else if (memberCount < MIN_COMMUNITY_MEMBERS) {
          setBlockReason(
            `This community needs at least ${MIN_COMMUNITY_MEMBERS} approved members to browse jobs. You currently have ${memberCount}.`
          );
        } else {
          setBlockReason(null);
        }
      })
      .catch(() => {
        if (!active) return;
        setBlockReason("Unable to load community eligibility.");
      })
      .finally(() => {
        if (active) setEligibilityLoading(false);
      });
    return () => {
      active = false;
    };
  }, [communityId]);

  useEffect(() => {
    if (blockReason || eligibilityLoading || !communityId) {
      setJobs([]);
      return;
    }
    let active = true;
    setJobsLoading(true);
    getMarketplaceJobs()
      .then((rows) => {
        if (active) setJobs(rows);
      })
      .catch((err) => {
        if (!active) return;
        setBlockReason(
          getErrorMessage(
            err,
            "Job marketplace is unavailable for this community right now."
          )
        );
        setJobs([]);
      })
      .finally(() => {
        if (active) setJobsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [blockReason, eligibilityLoading, communityId]);

  useEffect(() => {
    if (!communityId || blockReason) {
      setRecommendations([]);
      return;
    }
    setRecLoading(true);
    getRecommendedJobs(communityId)
      .then(setRecommendations)
      .catch(() => setRecommendations([]))
      .finally(() => setRecLoading(false));
  }, [communityId, blockReason]);

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

  const showRecommended = viewFilter === "recommended";
  const loading = eligibilityLoading || (!blockReason && jobsLoading);

  return (
    <PortalShell title="Browse Jobs" subtitle="Submit a bid for open jobs" navItems={communityAdminNav}>
      {community && (
        <p className="mb-4 text-sm text-muted">
          Browsing as <span className="font-semibold text-foreground">{community.name}</span>
        </p>
      )}

      {eligibilityLoading ? (
        <LoadingState label="Checking community eligibility…" />
      ) : blockReason ? (
        <Card className="border-amber-500/30 bg-amber-500/10 p-5">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            <div className="space-y-2">
              <p className="font-bold text-foreground">Marketplace access blocked</p>
              <p className="text-sm text-foreground">{blockReason}</p>
              {communityId && (
                <Link href={`/communities/${communityId}`} className="inline-block">
                  <Button variant="outline" size="sm" className="rounded-full">
                    View community profile
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <Button
              type="button"
              variant={viewFilter === "all" ? "gradient" : "outline"}
              className="rounded-full"
              onClick={() => setFilter("view", null)}
            >
              All jobs
            </Button>
            <Button
              type="button"
              variant={showRecommended ? "gradient" : "outline"}
              className="rounded-full"
              onClick={() => setFilter("view", "recommended")}
            >
              Recommended for Your Community
            </Button>
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
                description="Matches appear when open jobs align with your community skills and location."
              />
            ) : (
              recommendations.map((rec) => (
                <Card key={rec.job.id} className="mb-3 space-y-2">
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
                    <div className="flex items-center gap-2">
                      <Badge variant="info">{Math.round(rec.match_score)}% match</Badge>
                      <StatusBadge status={rec.job.status} kind="job" />
                    </div>
                  </div>
                  {rec.ai_blurb ? (
                    <p className="text-sm italic text-muted">{rec.ai_blurb}</p>
                  ) : (
                    <p className="text-sm text-muted">{rec.job.description.slice(0, 160)}…</p>
                  )}
                  {rec.job.status === "open" && communityId && (
                    <Link
                      href={hrefWithReturn(`/community-admin/jobs/${rec.job.id}/apply`)}
                      className="mt-1 inline-block"
                    >
                      <Button variant="gradient" className="rounded-full">
                        Submit Bid
                      </Button>
                    </Link>
                  )}
                </Card>
              ))
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
        </>
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
