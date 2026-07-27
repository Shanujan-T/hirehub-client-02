"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getCommunity } from "@/services/community";
import type { Community } from "@/types/community";
import { MemberCard } from "@/components/member-card";
import { Badge, Card } from "@/components/ui";

export default function CommunityDetailPage() {
  const params = useParams();
  const [community, setCommunity] = useState<Community | null>(null);

  useEffect(() => {
    if (params.id) {
      getCommunity(Number(params.id)).then(setCommunity).catch(console.error);
    }
  }, [params.id]);

  if (!community) return <p className="text-muted">Loading...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">{community.name}</h1>
        <p className="text-muted">{community.description}</p>
        <div className="mt-2 flex gap-2">
          <Badge>{community.location}</Badge>
          <Badge variant="success">★ {community.reputation_score.toFixed(1)}</Badge>
        </div>
      </div>
      <div>
        <h2 className="mb-4 text-xl font-bold">Members</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {community.members?.map((m) =>
            m.user ? <MemberCard key={m.id} user={m.user} /> : null
          )}
        </div>
      </div>
    </div>
  );
}
