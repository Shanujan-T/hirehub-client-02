"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CommunityMemberDetail } from "@/components/community-member-detail";
import { LoadingState } from "@/components/page-states";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { getCommunity, getCommunityMembers, getMyMemberships, removeCommunityMember } from "@/services/community";
import { getContracts } from "@/services/contract";
import type { CommunityMember } from "@/types/community";

async function loadMembership(communityId: number, membershipId: number): Promise<CommunityMember | null> {
  try {
    const rows = await getCommunityMembers(communityId, "approved");
    const fromList = rows.find((m) => m.id === membershipId);
    if (fromList) return fromList;
  } catch {
    // Fall back to community payload (public detail pages).
  }

  const community = await getCommunity(communityId);
  return community.members?.find((m) => m.id === membershipId) ?? null;
}

export function CommunityMemberDetailView({
  communityId,
  membershipId,
  removeRedirectHref,
}: {
  communityId: number;
  membershipId: number;
  /** Where to navigate after a successful remove action. */
  removeRedirectHref: string;
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [membership, setMembership] = useState<CommunityMember | null>(null);
  const [viewerMembership, setViewerMembership] = useState<CommunityMember | null>(null);
  const [contractStats, setContractStats] = useState<{ assigned: number; completed: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    loadMembership(communityId, membershipId)
      .then((row) => {
        if (!cancelled) setMembership(row);
      })
      .catch(() => {
        if (!cancelled) notify.error("Failed to load member");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [communityId, membershipId]);

  useEffect(() => {
    if (!user) {
      setViewerMembership(null);
      return;
    }

    getMyMemberships()
      .then((memberships) => {
        setViewerMembership(
          memberships.find((m) => m.community_id === communityId && m.status === "approved") ?? null
        );
      })
      .catch(() => setViewerMembership(null));
  }, [user, communityId]);

  const isCommunityAdmin = viewerMembership?.role === "admin";
  const isSelf = membership?.user_id === user?.id;

  useEffect(() => {
    if (!isCommunityAdmin || !membership?.user_id) {
      setContractStats(null);
      return;
    }

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
  }, [communityId, isCommunityAdmin, membership?.user_id]);

  const handleRemove = async () => {
    if (!membership) return;
    const name = membership.user?.full_name ?? `User #${membership.user_id}`;
    if (!window.confirm(`Remove ${name} from this community?`)) return;

    setRemoving(true);
    try {
      await removeCommunityMember(membership.id);
      notify.success(`${name} removed from the community`);
      router.push(removeRedirectHref);
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setRemoving(false);
    }
  };

  if (loading) return <LoadingState />;

  if (!membership) {
    return <p className="text-muted">Member not found.</p>;
  }

  return (
    <CommunityMemberDetail
      membership={membership}
      contractStats={isCommunityAdmin ? (contractStats ?? undefined) : undefined}
      showRemove={isCommunityAdmin && !isSelf}
      removing={removing}
      onRemove={() => void handleRemove()}
    />
  );
}
