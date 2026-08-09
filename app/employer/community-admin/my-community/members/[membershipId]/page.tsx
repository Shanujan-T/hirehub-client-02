"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { CommunityMemberDetailView } from "@/components/community-member-detail-view";
import { DashboardPortalShell } from "@/components/portal-shell";
import { LoadingState } from "@/components/page-states";
import { buildFilteredPath } from "@/lib/navigation";

function MemberDetailContent() {
  const params = useParams();
  const membershipId = Number(params.membershipId);
  const { communityId } = useCommunityAdmin();
  const membersListHref = buildFilteredPath("/employer/community-admin/my-community", { tab: "members" });

  return (
    <CommunityAdminRoute>
      <DashboardPortalShell
        title="Member Profile"
        subtitle="Community member details"
        backHref={membersListHref}
        backLabel="Back to members"
      >
        {communityId ? (
          <CommunityMemberDetailView
            communityId={communityId}
            membershipId={membershipId}
            removeRedirectHref={membersListHref}
          />
        ) : (
          <LoadingState />
        )}
      </DashboardPortalShell>
    </CommunityAdminRoute>
  );
}

export default function CommunityMemberDetailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <MemberDetailContent />
    </Suspense>
  );
}
