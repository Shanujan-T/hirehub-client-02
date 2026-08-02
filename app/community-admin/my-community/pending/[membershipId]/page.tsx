"use client";

import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { MemberCard } from "@/components/member-card";
import { DashboardPortalShell } from "@/components/portal-shell";
import { LoadingState } from "@/components/page-states";
import { Badge, Button, Card } from "@/components/ui";
import { buildFilteredPath } from "@/lib/navigation";
import { getErrorMessage } from "@/lib/utils";
import {
  analyzeJoinRequestFit,
  approveMember,
  getCommunityMembers,
  rejectMember,
  type JoinRequestFitAnalysis,
} from "@/services/community";
import type { CommunityMember } from "@/types/community";

function MembershipReviewContent() {
  const params = useParams();
  const router = useRouter();
  const membershipId = Number(params.membershipId);
  const { communityId } = useCommunityAdmin();
  const [membership, setMembership] = useState<CommunityMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JoinRequestFitAnalysis | null>(null);
  const [aiUnavailable, setAiUnavailable] = useState(false);

  const pendingListHref = buildFilteredPath("/community-admin/my-community", { tab: "pending" });

  useEffect(() => {
    if (!communityId) return;
    getCommunityMembers(communityId, "pending")
      .then((rows) => setMembership(rows.find((m) => m.id === membershipId) ?? null))
      .catch(() => toast.error("Failed to load request"))
      .finally(() => setLoading(false));
  }, [communityId, membershipId]);

  const handleAnalyze = async () => {
    if (!communityId || !membership || aiLoading) return;
    setAiLoading(true);
    setAiUnavailable(false);
    try {
      const result = await analyzeJoinRequestFit(communityId, membership.user_id);
      if (!result.available || !result.analysis) {
        setAiUnavailable(true);
        setAnalysis(null);
      } else {
        setAnalysis(result.analysis);
      }
    } catch {
      setAiUnavailable(true);
      setAnalysis(null);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await approveMember(membershipId);
      toast.success("Member approved");
      router.push(pendingListHref);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleReject = async () => {
    try {
      await rejectMember(membershipId);
      toast.success("Request rejected");
      router.push(pendingListHref);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <CommunityAdminRoute>
      <DashboardPortalShell
        title="Review Join Request"
        subtitle="Verify applicant skills before approving membership"
        backHref={pendingListHref}
        backLabel="Back to pending requests"
      >
        {loading ? (
          <LoadingState />
        ) : !membership ? (
          <p className="text-muted">Join request not found.</p>
        ) : (
          <Card className="max-w-lg space-y-4">
            {membership.user && (
              <MemberCard user={membership.user} skills={membership.user.user_skills} />
            )}

            <div className="space-y-2 rounded-xl border border-border/70 bg-background/40 p-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={aiLoading}
                onClick={() => void handleAnalyze()}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                {aiLoading ? "Analyzing…" : analysis ? "Refresh Fit Analysis" : "Analyze Fit"}
              </Button>
              {aiUnavailable && (
                <p className="text-xs text-muted">
                  AI suggestion unavailable — approve or reject as usual.
                </p>
              )}
              {analysis && (
                <div className="space-y-2">
                  <p className="text-sm leading-relaxed text-foreground">{analysis.fit_summary}</p>
                  {analysis.new_skills_added.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-success">Adds:</span>
                      {analysis.new_skills_added.map((skill) => (
                        <Badge key={`new-${skill}`} variant="completed" className="normal-case">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {analysis.overlap_skills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-info">Overlaps:</span>
                      {analysis.overlap_skills.map((skill) => (
                        <Badge key={`overlap-${skill}`} variant="info" className="normal-case">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-[11px] text-muted">
                    Assistive only — your Approve/Reject decision is final.
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="gradient" className="rounded-full" onClick={handleApprove}>
                Approve
              </Button>
              <Button variant="destructive" onClick={handleReject}>
                Reject
              </Button>
            </div>
          </Card>
        )}
      </DashboardPortalShell>
    </CommunityAdminRoute>
  );
}

export default function MembershipReviewPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <MembershipReviewContent />
    </Suspense>
  );
}
