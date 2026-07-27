"use client";

import Link from "next/link";
import { useCallback } from "react";
import { Badge, Card } from "@/components/ui";
import { EmptyState, LoadingState } from "@/components/page-states";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getCommunities } from "@/services/community";

export default function CommunitiesPage() {
  const { data: communities, loading } = useAsyncList(useCallback(() => getCommunities(), []));

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-3xl font-extrabold text-primary dark:text-foreground">Communities</h1>
        <p className="text-muted">Browse skilled communities — only teams apply to jobs</p>
      </div>
      {loading ? <LoadingState /> : communities.length === 0 ? (
        <EmptyState title="No communities yet" />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {communities.map((c) => (
            <Link key={c.id} href={`/communities/${c.id}`}>
              <Card className="transition hover:border-info">
                <h3 className="font-bold">{c.name}</h3>
                <p className="text-sm text-muted">{c.location}</p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="info">{c.member_count ?? 0} members</Badge>
                  <Badge variant="completed">★ {c.reputation_score.toFixed(1)}</Badge>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
