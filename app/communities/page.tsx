"use client";

import Link from "next/link";
import { Suspense, useMemo, useCallback } from "react";
import { BackButton } from "@/components/back-button";
import { CommunityBrowseCard } from "@/components/community-browse-card";
import { CommunityBrowseFilters } from "@/components/community-browse-filters";
import { EmptyState, LoadingState } from "@/components/page-states";
import { filterCommunities } from "@/lib/community-filters";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { getCommunities } from "@/services/community";

function CommunitiesBrowseContent() {
  const { hrefWithReturn, setFilter, getFilter } = useListNavigation();
  const locationFilter = getFilter("location");
  const queryFilter = getFilter("q");
  const categoryFilterRaw = getFilter("category_id");
  const categoryIdFilter = categoryFilterRaw ? Number(categoryFilterRaw) : null;
  const { data: communities, loading } = useAsyncList(useCallback(() => getCommunities(), []));

  const filtered = useMemo(
    () =>
      filterCommunities(
        communities,
        queryFilter,
        locationFilter,
        Number.isFinite(categoryIdFilter) ? categoryIdFilter : null
      ),
    [communities, locationFilter, queryFilter, categoryIdFilter]
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <BackButton fallbackHref="/" label="Back" />
      <div>
        <h1 className="text-3xl font-extrabold text-primary dark:text-foreground">Communities</h1>
        <p className="text-muted">
          {categoryIdFilter
            ? "Communities matching this job’s category — invite one to apply"
            : "Browse skilled communities — only teams apply to jobs"}
        </p>
      </div>
      <CommunityBrowseFilters
        queryFilter={queryFilter}
        locationFilter={locationFilter}
        onQueryChange={(value) => setFilter("q", value || null)}
        onLocationChange={(value) => setFilter("location", value || null)}
      />
      {loading ? (
        <LoadingState />
      ) : filtered.length === 0 ? (
        <EmptyState title="No communities yet" description="Try adjusting your filters." />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map((c) => (
            <Link key={c.id} href={hrefWithReturn(`/communities/${c.id}`)} className="block">
              <CommunityBrowseCard
                community={c}
                className="h-full transition hover:border-info"
              />
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
