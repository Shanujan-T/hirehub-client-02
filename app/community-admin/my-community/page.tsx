"use client";

import Link from "next/link";
import { Suspense } from "react";
import { toast } from "sonner";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button, Card } from "@/components/ui";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { buildFilteredPath } from "@/lib/navigation";import { getCommunityMembers } from "@/services/community";
import { useEffect, useState } from "react";
import type { CommunityMember } from "@/types/community";

function MyCommunityContent() {
  const { communityId } = useCommunityAdmin();
  const { hrefWithReturn, getFilter } = useListNavigation();
  const tab = getFilter("tab", "members");
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [pending, setPending] = useState<CommunityMember[]>([]);

  const reload = async (cid: number) => {
    setMembers(await getCommunityMembers(cid, "approved"));
    setPending(await getCommunityMembers(cid, "pending"));
  };

  useEffect(() => {
    if (communityId) reload(communityId).catch(() => toast.error("Failed to load members"));
  }, [communityId]);

  const pendingListHref = buildFilteredPath("/community-admin/my-community", { tab: "pending" });

  return (
    <CommunityAdminRoute>
      <PortalShell title="My Community" subtitle="Approve or reject join requests" navItems={communityAdminNav}>
        <div className="mb-6 flex gap-2">
          <Link href={buildFilteredPath("/community-admin/my-community", { tab: "members" })}>
            <Button variant={tab === "members" ? "gradient" : "outline"} size="sm" className="rounded-full">
              Members ({members.length})
            </Button>
          </Link>
          <Link href={pendingListHref}>
            <Button variant={tab === "pending" ? "gradient" : "outline"} size="sm" className="rounded-full">
              Pending ({pending.length})
            </Button>
          </Link>
        </div>

        {tab === "pending" ? (
          pending.length === 0 ? (
            <p className="text-muted">No pending join requests.</p>
          ) : (
            pending.map((m) => (
              <Card key={m.id} className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span>{m.user?.full_name ?? `User #${m.user_id}`}</span>
                <Link href={hrefWithReturn(`/community-admin/my-community/pending/${m.id}`)}>
                  <Button variant="outline" size="sm">Review Request</Button>
                </Link>
              </Card>
            ))
          )
        ) : (
          members.map((m) => (
            <Card key={m.id} className="mb-2 flex justify-between">
              <span>{m.user?.full_name ?? `User #${m.user_id}`}</span>
              <StatusBadge status={m.role === "admin" ? "active" : "open"} kind="member" />
            </Card>
          ))
        )}
      </PortalShell>
    </CommunityAdminRoute>
  );
}

export default function MyCommunityPage() {
  return (
    <Suspense fallback={null}>
      <MyCommunityContent />
    </Suspense>
  );
}
