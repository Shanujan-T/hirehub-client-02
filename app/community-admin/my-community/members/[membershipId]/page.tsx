"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { CommunityMemberDetail } from "@/components/community-member-detail";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { LoadingState } from "@/components/page-states";
import { buildFilteredPath } from "@/lib/navigation";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { getCommunityMembers, removeCommunityMember } from "@/services/community";
import { getContracts } from "@/services/contract";
import type { CommunityMember } from "@/types/community";

function MemberDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const membershipId = Number(params.membershipId);
  const { communityId } = useCommunityAdmin();
  const [membership, setMembership] = useState<CommunityMember | null>(null);
  const [contractStats, setContractStats] = useState<{ assigned: number; completed: number } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  const membersListHref = buildFilteredPath("/community-admin/my-community", { tab: "members" });

  useEffect(() => {
    if (!communityId) return;
    getCommunityMembers(communityId, "approved")
      .then((rows) => setMembership(rows.find((m) => m.id === membershipId) ?? null))
      .catch(() => notify.error("Failed to load member"))
      .finally(() => setLoading(false));
  }, [communityId, membershipId]);

  useEffect(() => {
    if (!communityId || !membership?.user_id) return;
    getContracts()
      .then((contracts) => {
        const assigned = contracts.filter(
          (c) => c.community_id === communityId && c.assigned_member_id === membership.user_id
        );
        setContractStats({
          assigned: assigned.length,
          completed: assigned.filter((c) => c.status === "completed").length,
        });
      })
      .catch(() => setContractStats(null));
  }, [communityId, membership?.user_id]);

  const isSelf = membership?.user_id === user?.id;

  const handleRemove = async () => {
    if (!membership) return;
    const name = membership.user?.full_name ?? `User #${membership.user_id}`;
    if (!window.confirm(`Remove ${name} from this community?`)) return;

    setRemoving(true);
    try {
      await removeCommunityMember(membership.id);
      notify.success(`${name} removed from the community`);
      router.push(membersListHref);
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setRemoving(false);
    }
  };

  const subtitle = useMemo(() => {
    if (!membership?.user) return "Member profile";
    return membership.user.full_name;
  }, [membership]);

  return (
    <CommunityAdminRoute>
      <PortalShell
        title="Member Profile"
        subtitle={subtitle}
        navItems={communityAdminNav}
        backHref={membersListHref}
        backLabel="Back to members"
      >
        {loading ? (
          <LoadingState />
        ) : !membership ? (
          <p className="text-muted">Member not found.</p>
        ) : (
          <CommunityMemberDetail
            membership={membership}
            contractStats={contractStats ?? undefined}
            showRemove={!isSelf}
            removing={removing}
            onRemove={() => void handleRemove()}
          />
        )}
      </PortalShell>
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
