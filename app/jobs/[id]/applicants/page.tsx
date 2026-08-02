"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { MemberCardPanel } from "@/components/member-card";
import { CommunityAvatar } from "@/components/community-avatar";
import { communityMemberDetailPath } from "@/lib/member-detail-paths";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { getErrorMessage } from "@/lib/utils";
import { approveCommunity, getJobApplicants, rejectCommunity } from "@/services/job";

function JobApplicantsContent() {
  const params = useParams();
  const jobId = Number(params.id);
  const { hrefWithReturn } = useListNavigation();
  const { data: applications, loading, reload } = useAsyncList(
    useCallback(() => getJobApplicants(jobId), [jobId])
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

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell
        title="Applying Communities"
        subtitle="Review community members, approve one community"
       
        backHref={`/jobs/${jobId}`}
        backLabel="Back to job"
      >
        {loading ? <LoadingState /> : applications.length === 0 ? (
          <EmptyState title="No applications yet" description="Communities can apply to this open job." />
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
                {app.status === "applied" && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="gradient" className="rounded-full" onClick={() => handleApprove(app.id)}>
                      Approve Community
                    </Button>
                    <Button variant="destructive" onClick={() => handleReject(app.id)}>Reject</Button>
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
