"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BackButton } from "@/components/back-button";
import { MemberCard } from "@/components/member-card";
import { Badge, Card } from "@/components/ui";
import { EmptyState, LoadingState } from "@/components/page-states";
import { useAsyncItem } from "@/lib/hooks/use-async";
import { getCommunity, getOpenCalls } from "@/services/community";
import type { OpenCall } from "@/types/community";

function CommunityDetailContent() {
  const params = useParams();
  const id = Number(params.id);
  const { data: community, loading } = useAsyncItem(useCallback(() => getCommunity(id), [id]));
  const [openCalls, setOpenCalls] = useState<OpenCall[]>([]);

  useEffect(() => {
    if (id) getOpenCalls(id).then(setOpenCalls).catch(() => {});
  }, [id]);

  if (loading) return <LoadingState />;
  if (!community) return <EmptyState title="Community not found" />;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <BackButton fallbackHref="/communities" label="Back to communities" />
      <div>
        <h1 className="text-3xl font-extrabold">{community.name}</h1>
        <p className="text-muted">{community.description}</p>
        <div className="mt-3 flex gap-2">
          <Badge variant="info">{community.location}</Badge>
          <Badge variant="completed">★ {community.reputation_score.toFixed(1)} reputation</Badge>
        </div>
      </div>
      <div>
        <h2 className="mb-4 text-xl font-bold">Members</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {community.members?.map((m) => m.user && <MemberCard key={m.id} user={m.user} />)}
        </div>
      </div>
      <div>
        <h2 className="mb-4 text-xl font-bold">Open Calls</h2>
        {openCalls.length === 0 ? (
          <EmptyState title="No open calls" />
        ) : (
          openCalls.map((oc) => (
            <Card key={oc.id} className="mb-2">
              <p className="font-bold">{oc.title}</p>
              <p className="text-sm text-muted">
                {oc.skills?.map((s) => s.skill?.name).filter(Boolean).join(", ") || "Open recruitment"}
              </p>
              <Badge variant="open" className="mt-2">{oc.status}</Badge>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default function CommunityDetailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <CommunityDetailContent />
    </Suspense>
  );
}
