"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Badge, Button, Card } from "@/components/ui";
import { getCommunities, getMyMemberships, joinCommunity } from "@/services/community";
import type { Community, CommunityMember } from "@/types/community";

export default function MemberCommunitiesPage() {
  const [memberships, setMemberships] = useState<CommunityMember[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    getMyMemberships().then(setMemberships);
    getCommunities().then(setCommunities);
  }, []);

  const handleJoin = async (communityId: number) => {
    try {
      await joinCommunity(communityId);
      toast.success("Join request sent");
      getMyMemberships().then(setMemberships);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed";
      toast.error(msg);
    }
  };

  const joinedIds = new Set(memberships.map((m) => m.community_id));

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">My Communities</h1>
          <p className="text-muted">Memberships and join requests</p>
        </div>
        <div>
          <h2 className="mb-2 text-xl font-bold">Memberships</h2>
          {memberships.map((m) => (
            <Card key={m.id} className="mb-2 flex justify-between">
              <Link href={`/communities/${m.community_id}`}>Community #{m.community_id}</Link>
              <Badge>{m.status} · {m.role}</Badge>
            </Card>
          ))}
        </div>
        <div>
          <h2 className="mb-2 text-xl font-bold">Browse & Join</h2>
          {communities.filter((c) => !joinedIds.has(c.id)).map((c) => (
            <Card key={c.id} className="mb-2 flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{c.name}</h3>
                <p className="text-sm text-muted">{c.location}</p>
              </div>
              <Button onClick={() => handleJoin(c.id)}>Request to Join</Button>
            </Card>
          ))}
        </div>
      </div>
    </AuthenticatedRoute>
  );
}
