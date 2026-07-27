"use client";

import Link from "next/link";
import { Suspense, useCallback } from "react";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { getOpenCalls } from "@/services/community";

function OpenCallsContent() {
  const { communityId } = useCommunityAdmin();
  const { hrefWithReturn } = useListNavigation();
  const fetchCalls = useCallback(() => (communityId ? getOpenCalls(communityId) : Promise.resolve([])), [communityId]);
  const { data: calls, loading } = useAsyncList(fetchCalls);

  return (
    <PortalShell
      title="Open Calls"
      subtitle="Recruit skilled users via open_call_skill"
      navItems={communityAdminNav}
      actions={
        <Link href={hrefWithReturn("/community-admin/open-calls/new")}>
          <Button variant="gradient" size="sm" className="rounded-full">New Open Call</Button>
        </Link>
      }
    >
      {loading ? <LoadingState /> : calls.length === 0 ? (
        <EmptyState title="No open calls" description="Create a call to recruit skilled members." />
      ) : (
        calls.map((c) => (
          <Card key={c.id} className="mb-2 flex justify-between">
            <div>
              <p className="font-bold">{c.title}</p>
              <p className="text-sm text-muted">
                {c.skills?.map((s) => s.skill?.name).filter(Boolean).join(", ") || "No skills listed"}
              </p>
            </div>
            <StatusBadge status={c.status} kind="job" />
          </Card>
        ))
      )}
    </PortalShell>
  );
}

export default function OpenCallsPage() {
  return (
    <CommunityAdminRoute>
      <Suspense fallback={<LoadingState />}>
        <OpenCallsContent />
      </Suspense>
    </CommunityAdminRoute>
  );
}
