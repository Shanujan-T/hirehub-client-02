"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { CommunityMemberDetailView } from "@/components/community-member-detail-view";
import { LoadingState } from "@/components/page-states";

function PublicMemberDetailContent() {
  const params = useParams();
  const communityId = Number(params.id);
  const membershipId = Number(params.membershipId);
  const communityHref = `/communities/${communityId}`;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <BackButton fallbackHref={communityHref} label="Back to community" />
      <div>
        <h1 className="text-2xl font-extrabold text-foreground">Member Profile</h1>
        <p className="text-sm text-muted">Community member details</p>
      </div>
      <CommunityMemberDetailView
        communityId={communityId}
        membershipId={membershipId}
        removeRedirectHref={communityHref}
      />
    </div>
  );
}

export default function PublicCommunityMemberDetailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PublicMemberDetailContent />
    </Suspense>
  );
}
