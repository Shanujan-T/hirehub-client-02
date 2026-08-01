"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { MemberCardPanel, sortMembersAdminFirst } from "@/components/member-card";
import { CommunityAvatar } from "@/components/community-avatar";
import { communityMemberDetailPath } from "@/lib/member-detail-paths";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { cn, getErrorMessage } from "@/lib/utils";
import {
  approveCommunity,
  getJobApplicants,
  getRecommendedCommunities,
  rejectCommunity,
  type CommunityMatchRecommendation,
} from "@/services/job";

function MatchScoreRing({
  score,
  size = "lg",
}: {
  score: number;
  size?: "md" | "lg";
}) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  const outer = size === "lg" ? "h-24 w-24" : "h-20 w-20";
  const inner = size === "lg" ? "h-[4.5rem] w-[4.5rem]" : "h-[3.85rem] w-[3.85rem]";
  const pctClass = size === "lg" ? "text-2xl" : "text-lg";

  return (
    <div
      className={cn("relative flex shrink-0 items-center justify-center rounded-full", outer)}
      style={{
        background: `conic-gradient(#4d2bd8 ${clamped * 3.6}deg, color-mix(in srgb, #08308b 12%, transparent) 0deg)`,
      }}
      aria-label={`${clamped}% match`}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center rounded-full bg-card text-center shadow-inner",
          inner
        )}
      >
        <span
          className={cn(
            "font-extrabold tabular-nums leading-none text-primary dark:text-foreground",
            pctClass
          )}
        >
          {clamped}%
        </span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
          match
        </span>
      </div>
    </div>
  );
}

function JobApplicantsContent() {
  const params = useParams();
  const jobId = Number(params.id);
  const { hrefWithReturn } = useListNavigation();
  const { data: applications, loading, reload } = useAsyncList(
    useCallback(() => getJobApplicants(jobId), [jobId])
  );
  const [recommendations, setRecommendations] = useState<CommunityMatchRecommendation[]>([]);
  const [recLoading, setRecLoading] = useState(true);

  useEffect(() => {
    setRecLoading(true);
    getRecommendedCommunities(jobId)
      .then(setRecommendations)
      .catch(() => setRecommendations([]))
      .finally(() => setRecLoading(false));
  }, [jobId]);

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

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell
        title="Applying Communities"
        subtitle="AI-ranked teams first — then review every application"
        backHref={`/jobs/${jobId}`}
        backLabel="Back to job"
      >
        <section className="relative mb-10 overflow-hidden rounded-2xl border border-secondary/20 bg-brand-wash p-5 sm:p-7">
          <div className="mb-5">
            <p className="inline-flex items-center gap-1.5 rounded-full border border-secondary/25 bg-card/80 px-2.5 py-1 text-xs font-bold text-secondary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden />
              AI Matched
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-primary dark:text-foreground sm:text-3xl">
              Recommended Communities
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted">
              Ranked by skills, ratings, and location — with a short AI explanation on the strongest
              fits.
            </p>
          </div>

          {recLoading ? (
            <LoadingState />
          ) : recommendations.length === 0 ? (
            <p className="text-sm text-muted">No strong community matches yet for this job.</p>
          ) : (
            <div className="grid gap-4">
              {recommendations.slice(0, 5).map((rec, index) => (
                <Card
                  key={rec.community.id}
                  className="border-border/80 bg-card/95 p-5 shadow-md shadow-secondary/10 sm:p-6"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <MatchScoreRing score={rec.match_score} size={index === 0 ? "lg" : "md"} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CommunityAvatar
                          name={rec.community.name}
                          imageUrl={rec.community.image_url}
                          size="sm"
                        />
                        <Link
                          href={hrefWithReturn(`/communities/${rec.community.id}`)}
                          className="text-xl font-extrabold hover:text-info"
                        >
                          {rec.community.name}
                        </Link>
                        {index < 3 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-info/10 px-2 py-0.5 text-[11px] font-bold text-info">
                            <Sparkles className="h-3 w-3" aria-hidden />
                            AI Matched
                          </span>
                        )}
                      </div>
                      {rec.ai_blurb ? (
                        <p className="mt-3 text-sm leading-relaxed text-muted italic">
                          “{rec.ai_blurb}”
                        </p>
                      ) : (
                        <p className="mt-3 text-sm text-muted">
                          {index < 3 && rec.ai_available === false
                            ? "AI suggestion unavailable — score still reflects skills and location."
                            : rec.skill_summary}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <div className="mb-3 border-t border-border/60 pt-8">
          <h2 className="text-lg font-bold text-foreground">All applications</h2>
          <p className="text-sm text-muted">Unranked list of communities that submitted a bid</p>
        </div>
        {loading ? (
          <LoadingState />
        ) : applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="Communities can apply to this open job."
          />
        ) : (
          <div className="grid gap-4">
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
                  <StatusBadge status={app.status} kind="application" />
                </div>
                <div className="mb-4 grid gap-3 rounded-xl border border-border/70 bg-background/40 p-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Bid</p>
                    <p className="mt-0.5 font-bold text-foreground">
                      ${app.proposed_cost.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Timeline
                    </p>
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
                  {sortMembersAdminFirst(app.community?.members ?? []).map(
                    (m) =>
                      m.user && (
                        <MemberCardPanel
                          key={m.id}
                          user={m.user}
                          skills={m.user.user_skills}
                          role={m.role}
                          detailHref={communityMemberDetailPath(app.community_id, m.id, "public")}
                        />
                      )
                  )}
                </div>
                {app.status === "applied" && (
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
