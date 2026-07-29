"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { CommunityBrowseFilters } from "@/components/community-browse-filters";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { filterCommunities } from "@/lib/community-filters";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { getCommunities, getMyMemberships, joinCommunity } from "@/services/community";
import type { Community } from "@/types/community";

function CreateCommunityAction() {
  const { user } = useAuth();
  const verified = user?.identity_status === "verified";

  if (verified) {
    return (
      <Link href="/member/communities/new">
        <Button variant="gradient" size="sm" className="rounded-full">
          Create Community
        </Button>
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button variant="gradient" size="sm" className="rounded-full" disabled title="Verify your identity first">
        Create Community
      </Button>
      <Link href="/member/profile/identity-verification" className="text-xs text-info hover:underline">
        Verify your identity first
      </Link>
    </div>
  );
}

function MemberCommunitiesContent() {
  const { hrefWithReturn, setFilter, getFilter } = useListNavigation();
  const locationFilter = getFilter("location");
  const queryFilter = getFilter("q");
  const { data: memberships, loading, reload } = useAsyncList(useCallback(() => getMyMemberships(), []));
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);

  useEffect(() => {
    getCommunities()
      .then(setCommunities)
      .catch(() => notify.error("Failed to load communities"))
      .finally(() => setCommunitiesLoading(false));
  }, []);

  const joinedIds = useMemo(() => new Set(memberships.map((m) => m.community_id)), [memberships]);

  const browseCommunities = useMemo(
    () => communities.filter((community) => !joinedIds.has(community.id)),
    [communities, joinedIds]
  );

  const filteredBrowse = useMemo(
    () => filterCommunities(browseCommunities, queryFilter, locationFilter),
    [browseCommunities, locationFilter, queryFilter]
  );

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
    <AuthenticatedRoute>
      <DashboardPortalShell
        title="My Communities"
        subtitle="Memberships, join requests, and new communities"
       
        actions={<CreateCommunityAction />}
      >
        {loading ? (
          <LoadingState />
        ) : (
          <>
            <h2 className="mb-3 font-bold">Memberships</h2>
            {memberships.length === 0 ? (
              <EmptyState title="No memberships" />
            ) : (
              memberships.map((membership) => (
                <Card key={membership.id} className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link
                      href={hrefWithReturn(`/communities/${membership.community_id}`)}
                      className="font-medium hover:text-info"
                    >
                      {membership.community?.name ?? `Community #${membership.community_id}`}
                    </Link>
                    {membership.community?.rejection_reason && membership.community.status === "rejected" && (
                      <p className="text-xs text-destructive">{membership.community.rejection_reason}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {membership.community?.status && (
                      <StatusBadge status={membership.community.status} kind="community" />
                    )}
                    <StatusBadge status={membership.status} kind="member" />
                  </div>
                </Card>
              ))
            )}

            <h2 className="mb-3 mt-8 font-bold">Browse & Join</h2>
            <div className="mb-4">
              <CommunityBrowseFilters
                queryFilter={queryFilter}
                locationFilter={locationFilter}
                onQueryChange={(value) => setFilter("q", value || null)}
                onLocationChange={(value) => setFilter("location", value || null)}
                queryInputId="member-community-q"
                locationInputId="member-community-location"
              />
            </div>

            {communitiesLoading ? (
              <LoadingState />
            ) : filteredBrowse.length === 0 ? (
              <EmptyState title="No communities match your search" />
            ) : (
              filteredBrowse.map((community) => (
                <Card key={community.id} className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Link href={hrefWithReturn(`/communities/${community.id}`)} className="font-bold hover:text-info">
                      {community.name}
                    </Link>
                    <p className="text-sm text-muted">{community.location}</p>
                  </div>
                  <Button variant="gradient" size="sm" className="rounded-full" onClick={() => handleJoin(community.id)}>
                    Request to Join
                  </Button>
                </Card>
              ))
            )}
          </>
        )}
      </DashboardPortalShell>
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
