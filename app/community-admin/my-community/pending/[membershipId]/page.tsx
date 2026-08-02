"use client";

import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { MemberCard } from "@/components/member-card";
import { DashboardPortalShell } from "@/components/portal-shell";
import { LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { buildFilteredPath } from "@/lib/navigation";
import { getErrorMessage } from "@/lib/utils";
import { approveMember, getCommunityMembers, rejectMember } from "@/services/community";
import type { CommunityMember } from "@/types/community";

function MembershipReviewContent() {
  const params = useParams();
  const router = useRouter();
  const membershipId = Number(params.membershipId);
  const { communityId } = useCommunityAdmin();
  const [membership, setMembership] = useState<CommunityMember | null>(null);
  const [loading, setLoading] = useState(true);

  const pendingListHref = buildFilteredPath("/community-admin/my-community", { tab: "pending" });

  useEffect(() => {
    if (!communityId) return;
    getCommunityMembers(communityId, "pending")
      .then((rows) => setMembership(rows.find((m) => m.id === membershipId) ?? null))
      .catch(() => toast.error("Failed to load request"))
      .finally(() => setLoading(false));
  }, [communityId, membershipId]);

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
            <div className="flex gap-2">
              <Button variant="gradient" className="rounded-full" onClick={handleApprove}>Approve</Button>
              <Button variant="destructive" onClick={handleReject}>Reject</Button>
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
