"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCommunities } from "@/services/community";
import type { Community } from "@/types/community";
import { Badge, Card } from "@/components/ui";

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    getCommunities().then(setCommunities).catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Communities</h1>
        <p className="text-muted">Browse skilled communities and their reputation</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {communities.map((c) => (
          <Link key={c.id} href={`/communities/${c.id}`}>
            <Card className="transition hover:border-primary">
              <h3 className="font-semibold">{c.name}</h3>
              <p className="text-sm text-muted">{c.location}</p>
              <div className="mt-2 flex gap-2">
                <Badge>{c.member_count ?? 0} members</Badge>
                <Badge variant="success">★ {c.reputation_score.toFixed(1)}</Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
