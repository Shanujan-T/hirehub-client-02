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
import { Button, Card } from "@/components/ui";
import { buildFilteredPath } from "@/lib/navigation";
import { getErrorMessage } from "@/lib/utils";
import {
  analyzeJoinRequestFit,
  approveMember,
  getCommunityMembers,
  rejectMember,
  type FitAnalysis,
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
  const [analysis, setAnalysis] = useState<FitAnalysis | null>(null);
  const [aiUnavailable, setAiUnavailable] = useState(false);

  const pendingListHref = buildFilteredPath("/employer/community-admin/my-community", { tab: "pending" });

  useEffect(() => {
    if (!communityId) return;
    getCommunityMembers(communityId, "pending")
      .then((rows) => setMembership(rows.find((m) => m.id === membershipId) ?? null))
      .catch(() => toast.error("Failed to load request"))
      .finally(() => setLoading(false));
  }, [communityId, membershipId]);

  const handleFitAnalysis = async () => {
    if (!communityId || !membership?.user_id || aiLoading) return;
    setAiLoading(true);
    setAiUnavailable(false);
    try {
      const result = await analyzeJoinRequestFit(communityId, membership.user_id);
      if (!result.available || !result.analysis) {
        setAiUnavailable(true);
        setAnalysis(null);
        return;
      }
      setAnalysis(result.analysis);
    } catch (err) {
      setAiUnavailable(true);
      toast.error(getErrorMessage(err, "AI suggestion unavailable"));
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
            {membership.user && <MemberCard user={membership.user} />}

            <div className="space-y-3 rounded-xl border border-border/70 bg-background/40 p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-sm font-bold">
                  <Sparkles className="h-4 w-4" aria-hidden />
                  Fit Analysis
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={aiLoading}
                  onClick={() => void handleFitAnalysis()}
                >
                  {aiLoading ? "Analyzing…" : analysis ? "Refresh Analysis" : "Run Fit Analysis"}
                </Button>
              </div>
              {analysis && (
                <div className="space-y-2 text-sm">
                  <p>{analysis.fit_summary}</p>
                  {analysis.overlap_skills.length > 0 && (
                    <p className="text-muted">
                      Overlap: {analysis.overlap_skills.join(", ")}
                    </p>
                  )}
                  {analysis.new_skills_added.length > 0 && (
                    <p className="text-muted">
                      New skills: {analysis.new_skills_added.join(", ")}
                    </p>
                  )}
                </div>
              )}
              {aiUnavailable && (
                <p className="text-xs text-muted">AI suggestion unavailable.</p>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="gradient"
                className="rounded-full"
                disabled={aiLoading}
                onClick={handleApprove}
              >
                Approve
              </Button>
              <Button variant="destructive" disabled={aiLoading} onClick={handleReject}>
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
