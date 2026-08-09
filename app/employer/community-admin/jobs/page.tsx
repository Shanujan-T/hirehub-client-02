"use client";

import Link from "next/link";
import { Suspense, useCallback, useMemo } from "react";
import { Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { MatchScoreBadge } from "@/components/match-score-badge";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Badge, Button, Card, Input, Label } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { getErrorMessage, cn } from "@/lib/utils";
import {
  approveCommunity,
  getMarketplaceJobs,
  getMyJobApplications,
  rejectCommunity,
} from "@/services/job";
import { getRecommendedJobs } from "@/services/community";

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
  const {
    data: myApplications,
    loading: appsLoading,
    reload: reloadApps,
  } = useAsyncList(
    useCallback(() => getMyJobApplications(), []),
    "Failed to load applications"
  );

  const pendingInvites = useMemo(
    () =>
      myApplications.filter(
        (app) =>
          app.source === "invited" &&
          app.status === "applied" &&
          (!communityId || app.community_id === communityId)
      ),
    [myApplications, communityId]
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

  const handleAcceptInvite = async (applicationId: number) => {
    try {
      await approveCommunity(applicationId, 3);
      toast.success("Invitation accepted — contract created");
      reloadApps();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to accept invitation"));
    }
  };

  const handleDeclineInvite = async (applicationId: number) => {
    try {
      await rejectCommunity(applicationId);
      toast.success("Invitation declined");
      reloadApps();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to decline invitation"));
    }
  };

  return (
    <DashboardPortalShell title="Browse Jobs" subtitle="Submit a bid for open jobs">
      {!appsLoading && pendingInvites.length > 0 && (
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2">
            <Mail className="h-5 w-5 text-secondary" aria-hidden />
            <h2 className="text-lg font-extrabold text-foreground">Invitations from employers</h2>
          </div>
          <p className="mb-4 text-sm text-muted">
            Employers reached out to your community. Accept to create a contract, or decline.
          </p>
          {pendingInvites.map((app) => (
            <Card key={app.id} className="mb-3 border-secondary/30 bg-secondary/[0.04]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <Badge variant="active" className="normal-case">
                      <Mail className="mr-1 h-3 w-3" aria-hidden />
                      Invited by employer
                    </Badge>
                    <StatusBadge status={app.status} kind="application" />
                  </div>
                  <Link
                    href={hrefWithReturn(`/employer/community-admin/jobs/${app.job_id}`)}
                    className="font-bold hover:text-info"
                  >
                    {app.job?.title ?? `Job #${app.job_id}`}
                  </Link>
                  <p className="text-sm text-muted">
                    {app.job?.location ?? "—"} · Offered ${app.proposed_cost.toFixed(2)} ·{" "}
                    {app.proposed_days} day{app.proposed_days === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="gradient"
                    size="sm"
                    className="rounded-full"
                    onClick={() => void handleAcceptInvite(app.id)}
                  >
                    Accept invitation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => void handleDeclineInvite(app.id)}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </section>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("view", null)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition",
            !showRecommended
              ? "bg-brand-gradient font-semibold text-white shadow-sm shadow-secondary/20"
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
                        href={hrefWithReturn(`/employer/community-admin/jobs/${rec.job.id}`)}
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
                      href={hrefWithReturn(`/employer/community-admin/jobs/${rec.job.id}/apply`)}
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
        filtered.map((job) => {
          const inviteApp = myApplications.find(
            (a) => a.job_id === job.id && a.source === "invited" && a.status === "applied"
          );
          return (
            <Card key={job.id} className="mb-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    {inviteApp && (
                      <Badge variant="active" className="normal-case">
                        <Mail className="mr-1 h-3 w-3" aria-hidden />
                        Invited by employer
                      </Badge>
                    )}
                  </div>
                  <Link
                    href={hrefWithReturn(`/employer/community-admin/jobs/${job.id}`)}
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
              {job.status === "open" && communityId && !inviteApp && (
                <Link
                  href={hrefWithReturn(`/employer/community-admin/jobs/${job.id}/apply`)}
                  className="mt-3 inline-block"
                >
                  <Button variant="gradient" className="rounded-full">
                    Submit Bid
                  </Button>
                </Link>
              )}
              {inviteApp && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="gradient"
                    size="sm"
                    className="rounded-full"
                    onClick={() => void handleAcceptInvite(inviteApp.id)}
                  >
                    Accept invitation
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => void handleDeclineInvite(inviteApp.id)}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </Card>
          );
        })
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
