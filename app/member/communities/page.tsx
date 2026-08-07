"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { CommunityBrowseCard } from "@/components/community-browse-card";
import { CommunityBrowseFilters } from "@/components/community-browse-filters";
import { CreateCommunityAction } from "@/components/create-community-action";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { filterCommunities } from "@/lib/community-filters";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/utils";
import { getCommunities, getMyMemberships, joinCommunity } from "@/services/community";
import { useAuth } from "@/providers/auth-provider";
import type { Community } from "@/types/community";

function MemberCommunitiesContent() {
  const router = useRouter();
  const { user } = useAuth();
  const { hrefWithReturn, setFilter, getFilter } = useListNavigation();
  const locationFilter = getFilter("location");
  const queryFilter = getFilter("q");
  const { data: memberships, loading, reload } = useAsyncList(
    useCallback(() => getMyMemberships(), [])
  );
  const [communities, setCommunities] = useState<Community[]>([]);
  const [communitiesLoading, setCommunitiesLoading] = useState(true);

  useEffect(() => {
    getCommunities()
      .then(setCommunities)
      .catch(() => notify.error("Failed to load communities"))
      .finally(() => setCommunitiesLoading(false));
  }, []);

  const joinedIds = useMemo(
    () => new Set(memberships.map((m) => m.community_id)),
    [memberships]
  );

  const browseCommunities = useMemo(
    () => communities.filter((community) => !joinedIds.has(community.id)),
    [communities, joinedIds]
  );

  const filteredBrowse = useMemo(
    () => filterCommunities(browseCommunities, queryFilter, locationFilter),
    [browseCommunities, locationFilter, queryFilter]
  );

  const [showNoSkillsDialog, setShowNoSkillsDialog] = useState(false);

  const hasSkills = user?.user_skills !== undefined ? user.user_skills.length > 0 : true;

  const handleJoin = async (communityId: number) => {
    try {
      await joinCommunity(communityId);
      notify.success("Join request sent");
      reload();
    } catch (err) {
      notify.error(getErrorMessage(err));
    }
  };

  const handleJoinClick = (communityId: number) => {
    if (!hasSkills) {
      setShowNoSkillsDialog(true);
    } else {
      void handleJoin(communityId);
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
                <Card
                  key={membership.id}
                  className="mb-2 flex flex-wrap items-center justify-between gap-2 p-4"
                >
                  <div>
                    <Link
                      href={hrefWithReturn(`/communities/${membership.community_id}`)}
                      className="font-medium hover:text-info"
                    >
                      {membership.community?.name ?? `Community #${membership.community_id}`}
                    </Link>
                    {membership.community?.rejection_reason &&
                      membership.community.status === "rejected" && (
                        <p className="text-xs text-destructive">
                          {membership.community.rejection_reason}
                        </p>
                      )}
                  </div>
                  <StatusBadge status={membership.status} kind="member" />
                </Card>
              ))
            )}

            <h2 className="mb-3 mt-8 font-bold">Browse & Join</h2>
            <div className="mb-3">
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
              <div className="space-y-3">
                {filteredBrowse.map((community) => (
                  <CommunityBrowseCard
                    key={community.id}
                    community={community}
                    href={hrefWithReturn(`/communities/${community.id}`)}
                    action={
                      <Button
                        variant="gradient"
                        size="sm"
                        className="rounded-full"
                        onClick={() => handleJoinClick(community.id)}
                      >
                        Request to Join
                      </Button>
                    }
                  />
                ))}
              </div>
            )}
          </>
        )}
        <ConfirmDialog
          open={showNoSkillsDialog}
          onClose={() => setShowNoSkillsDialog(false)}
          onConfirm={() => {
            setShowNoSkillsDialog(false);
            router.push("/profile");
          }}
          title="Add a skill to your profile first"
          description="You need at least one skill listed before requesting to join a community."
          confirmLabel="Go to Profile"
          cancelLabel="Cancel"
        />
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
