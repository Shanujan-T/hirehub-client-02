"use client";

import Link from "next/link";
import { Suspense, useCallback } from "react";
import { useParams } from "next/navigation";
import { Mail, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { MemberCardPanel } from "@/components/member-card";
import { CommunityAvatar } from "@/components/community-avatar";
import { MatchScoreBadge } from "@/components/match-score-badge";
import { communityMemberDetailPath } from "@/lib/member-detail-paths";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Badge, Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { getErrorMessage } from "@/lib/utils";
import {
  approveCommunity,
  getJobApplicants,
  getRecommendedCommunities,
  rejectCommunity,
} from "@/services/job";

function JobApplicantsContent() {
  const params = useParams();
  const jobId = Number(params.id);
  const { hrefWithReturn } = useListNavigation();
  const { data: applications, loading, reload } = useAsyncList(
    useCallback(() => getJobApplicants(jobId), [jobId])
  );
  const {
    data: recommendations,
    loading: recLoading,
  } = useAsyncList(
    useCallback(async () => {
      try {
        return await getRecommendedCommunities(jobId);
      } catch {
        // Matching is assistive — never block applicants list
        return [];
      }
    }, [jobId]),
    "Failed to load recommendations"
  );

  const handleApprove = async (applicationId: number) => {
    try {
      await approveCommunity(applicationId, 3);
      toast.success("Community approved — contract created");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to approve"));
    }
  };

  const handleReject = async (applicationId: number) => {
    try {
      await rejectCommunity(applicationId);
      toast.success("Application rejected");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to reject"));
    }
  };

  const topMatches = recommendations.slice(0, 6);

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell
        title="Applying Communities"
        subtitle="Review community members, approve one community"
        backHref={`/user/jobs/${jobId}`}
        backLabel="Back to job"
      >
        {!recLoading && topMatches.length > 0 && (
          <section className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-secondary" aria-hidden />
              <h2 className="text-lg font-extrabold text-foreground">
                ✨ AI Matched — Recommended Communities
              </h2>
            </div>
            <p className="mb-4 text-sm text-muted">
              Ranked by member skill overlap and location fit. AI blurbs appear for top matches when available.
            </p>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {topMatches.map((rec) => (
                <Card key={rec.community.id} className="flex gap-3 !p-4">
                  <MatchScoreBadge score={rec.match_score} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <CommunityAvatar
                        name={rec.community.name}
                        imageUrl={rec.community.image_url}
                        size="sm"
                      />
                      <Link
                        href={hrefWithReturn(`/communities/${rec.community.id}`)}
                        className="truncate font-bold hover:text-info"
                      >
                        {rec.community.name}
                      </Link>
                    </div>
                    {rec.ai_blurb ? (
                      <p className="mt-2 text-sm text-foreground">{rec.ai_blurb}</p>
                    ) : (
                      <p className="mt-2 text-sm text-muted">
                        {rec.skill_summary || "Strong skill overlap with this job."}
                        {rec.location_match ? " Location match." : ""}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-muted">
                      {rec.location_match && (
                        <span className="rounded-full bg-background px-2 py-0.5">Location</span>
                      )}
                      {rec.category_match && (
                        <span className="rounded-full bg-background px-2 py-0.5">Category</span>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {loading ? (
          <LoadingState />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Communities can apply to this open job."
          />
        ) : (
          <div className="grid gap-4">
            <h2 className="text-base font-bold text-foreground">Applicants</h2>
            {applications.map((app) => (
              <Card key={app.id}>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {app.community && (
                      <CommunityAvatar
                        name={app.community.name}
                        imageUrl={app.community.image_url}
                        size="sm"
                      />
                    )}
                    <Link
                      href={hrefWithReturn(`/communities/${app.community_id}`)}
                      className="text-lg font-bold hover:text-info"
                    >
                      {app.community?.name}
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {app.source === "invited" && (
                      <Badge variant="active" className="normal-case">
                        <Mail className="mr-1 h-3 w-3" aria-hidden />
                        Invited by you
                      </Badge>
                    )}
                    <StatusBadge status={app.status} kind="application" />
                  </div>
                </div>
                <div className="mb-4 grid gap-3 rounded-xl border border-border/70 bg-background/40 p-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Bid</p>
                    <p className="mt-0.5 font-bold text-foreground">${app.proposed_cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Timeline</p>
                    <p className="mt-0.5 font-bold text-foreground">
                      {app.proposed_days} day{app.proposed_days === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="sm:col-span-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Note</p>
                    <p className="mt-0.5 text-sm text-foreground">
                      {app.note?.trim() ? app.note : "No note provided"}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {app.community?.members?.map(
                    (m) =>
                      m.user && (
                        <MemberCardPanel
                          key={m.id}
                          user={m.user}
                          skills={m.user.user_skills}
                          detailHref={communityMemberDetailPath(app.community_id, m.id, "public")}
                        />
                      )
                  )}
                </div>
                {app.status === "applied" && app.source !== "invited" && (
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="gradient"
                      className="rounded-full"
                      onClick={() => handleApprove(app.id)}
                    >
                      Approve Community
                    </Button>
                    <Button variant="destructive" onClick={() => handleReject(app.id)}>
                      Reject
                    </Button>
                  </div>
                )}
                {app.status === "applied" && app.source === "invited" && (
                  <p className="mt-4 text-sm text-muted">
                    Waiting for the community admin to accept or decline this invitation.
                  </p>
                )}
              </Card>
            ))}
          </div>
        )}
      </DashboardPortalShell>
    </AuthenticatedRoute>
  );
}

export default function JobApplicantsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <JobApplicantsContent />
    </Suspense>
  );
}
