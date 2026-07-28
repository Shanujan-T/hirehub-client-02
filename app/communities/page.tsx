"use client";

import Link from "next/link";
import { Suspense, useMemo, useCallback } from "react";
import { BackButton } from "@/components/back-button";
import { Badge, Card, Input, Label } from "@/components/ui";
import { EmptyState, LoadingState } from "@/components/page-states";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { getCommunities } from "@/services/community";

function CommunitiesBrowseContent() {
  const { hrefWithReturn, setFilter, getFilter } = useListNavigation();
  const locationFilter = getFilter("location");
  const queryFilter = getFilter("q");
  const { data: communities, loading } = useAsyncList(useCallback(() => getCommunities(), []));

  const filtered = useMemo(() => {
    return communities.filter((c) => {
      if (locationFilter && !(c.location ?? "").toLowerCase().includes(locationFilter.toLowerCase())) {
        return false;
      }
      if (queryFilter) {
        const q = queryFilter.toLowerCase();
        return c.name.toLowerCase().includes(q) || (c.description ?? "").toLowerCase().includes(q);
      }
      return true;
    });
  }, [communities, locationFilter, queryFilter]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <BackButton fallbackHref="/" label="Back" />
      <div>
        <h1 className="text-3xl font-extrabold text-primary dark:text-foreground">Communities</h1>
        <p className="text-muted">Browse skilled communities — only teams apply to jobs</p>
      </div>
      <Card className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="community-q">Search</Label>
          <Input
            id="community-q"
            placeholder="Community name"
            value={queryFilter}
            onChange={(e) => setFilter("q", e.target.value || null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="community-location">Location</Label>
          <Input
            id="community-location"
            placeholder="City or area"
            value={locationFilter}
            onChange={(e) => setFilter("location", e.target.value || null)}
          />
        </div>
      </Card>
      {loading ? <LoadingState /> : filtered.length === 0 ? (
        <EmptyState title="No communities yet" description="Try adjusting your filters." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((c) => (
            <Link key={c.id} href={hrefWithReturn(`/communities/${c.id}`)}>
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

export default function CommunitiesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CommunitiesBrowseContent />
    </Suspense>
  );
}
