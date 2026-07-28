"use client";

import { Suspense, useCallback } from "react";
import Link from "next/link";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, memberNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/utils";
import { getCommunities, getMyMemberships, joinCommunity } from "@/services/community";
import { useEffect, useState } from "react";
import type { Community } from "@/types/community";

function MemberCommunitiesContent() {
  const { hrefWithReturn } = useListNavigation();
  const { data: memberships, loading, reload } = useAsyncList(useCallback(() => getMyMemberships(), []));
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    getCommunities().then(setCommunities).catch(() => notify.error("Failed to load communities"));
  }, []);

  const joinedIds = new Set(memberships.map((m) => m.community_id));

  const handleJoin = async (communityId: number) => {
    try {
      await joinCommunity(communityId);
      notify.success("Join request sent");
      reload();
    } catch (err) {
      notify.error(getErrorMessage(err));
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <PortalShell
        title="My Communities"
        subtitle="Memberships, join requests, and new communities"
        navItems={memberNav}
        actions={
          <Link href="/member/communities/new">
            <Button variant="gradient" size="sm" className="rounded-full">
              Create Community
            </Button>
          </Link>
        }
      >
        {loading ? <LoadingState /> : (
          <>
            <h2 className="mb-3 font-bold">Memberships</h2>
            {memberships.length === 0 ? <EmptyState title="No memberships" /> : memberships.map((m) => (
              <Card key={m.id} className="mb-2 flex justify-between">
                <Link href={hrefWithReturn(`/communities/${m.community_id}`)} className="font-medium hover:text-info">
                  Community #{m.community_id}
                </Link>
                <StatusBadge status={m.status} kind="member" />
              </Card>
            ))}
            <h2 className="mb-3 mt-8 font-bold">Browse & Join</h2>
            {communities.filter((c) => !joinedIds.has(c.id)).map((c) => (
              <Card key={c.id} className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <Link href={hrefWithReturn(`/communities/${c.id}`)} className="font-bold hover:text-info">{c.name}</Link>
                  <p className="text-sm text-muted">{c.location}</p>
                </div>
                <Button variant="gradient" size="sm" className="rounded-full" onClick={() => handleJoin(c.id)}>
                  Request to Join
                </Button>
              </Card>
            ))}
          </>
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}

export default function MemberCommunitiesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <MemberCommunitiesContent />
    </Suspense>
  );
}
