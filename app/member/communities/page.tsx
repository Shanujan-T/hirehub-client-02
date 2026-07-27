"use client";

import { useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, memberNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getErrorMessage } from "@/lib/utils";
import { getCommunities, getMyMemberships, joinCommunity } from "@/services/community";
import { useEffect, useState } from "react";
import type { Community } from "@/types/community";

export default function MemberCommunitiesPage() {
  const { data: memberships, loading, reload } = useAsyncList(useCallback(() => getMyMemberships(), []));
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    getCommunities().then(setCommunities).catch(() => toast.error("Failed to load communities"));
  }, []);

  const joinedIds = new Set(memberships.map((m) => m.community_id));

  const handleJoin = async (communityId: number) => {
    try {
      await joinCommunity(communityId);
      toast.success("Join request sent");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <PortalShell title="My Communities" subtitle="community_member memberships" navItems={memberNav}>
        {loading ? <LoadingState /> : (
          <>
            <h2 className="mb-3 font-bold">Memberships</h2>
            {memberships.length === 0 ? <EmptyState title="No memberships" /> : memberships.map((m) => (
              <Card key={m.id} className="mb-2 flex justify-between">
                <Link href={`/communities/${m.community_id}`} className="font-medium hover:text-info">Community #{m.community_id}</Link>
                <StatusBadge status={m.status} kind="member" />
              </Card>
            ))}
            <h2 className="mb-3 mt-8 font-bold">Browse & Join</h2>
            {communities.filter((c) => !joinedIds.has(c.id)).map((c) => (
              <Card key={c.id} className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div><h3 className="font-bold">{c.name}</h3><p className="text-sm text-muted">{c.location}</p></div>
                <Button variant="gradient" size="sm" className="rounded-full" onClick={() => handleJoin(c.id)}>Request to Join</Button>
              </Card>
            ))}
          </>
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
