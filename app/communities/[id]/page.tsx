"use client";

import { Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { BackButton } from "@/components/back-button";
import { CommunityAvatar } from "@/components/community-avatar";
import { MemberCardPanel, sortMembersAdminFirst } from "@/components/member-card";
import { StatusBadge } from "@/components/status-badge";
import { communityMemberDetailPath } from "@/lib/member-detail-paths";
import { Badge, Button, Card } from "@/components/ui";
import { EmptyState, LoadingState } from "@/components/page-states";
import { useAsyncItem } from "@/lib/hooks/use-async";
import { appendReturnTo } from "@/lib/navigation";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { getCommunity, getMyMemberships, getOpenCalls, joinCommunity } from "@/services/community";
import type { CommunityMember, OpenCall } from "@/types/community";
import { AlertTriangle } from "lucide-react";

function CommunityDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { user, loading: authLoading } = useAuth();
  const { data: community, loading } = useAsyncItem(useCallback(() => getCommunity(id), [id]));
  const [openCalls, setOpenCalls] = useState<OpenCall[]>([]);
  const [membership, setMembership] = useState<CommunityMember | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinSent, setJoinSent] = useState(false);

  useEffect(() => {
    if (id) getOpenCalls(id).then(setOpenCalls).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!user || user.role !== "user") {
      setMembership(null);
      return;
    }
    getMyMemberships()
      .then((memberships) => {
        const match = memberships.find((m) => m.community_id === id) ?? null;
        setMembership(match);
        if (match?.status === "pending") setJoinSent(true);
      })
      .catch(() => {});
  }, [user, id]);

  const handleRequestJoin = async () => {
    if (!user) {
      router.push(appendReturnTo("/auth/login", `/communities/${id}`));
      return;
    }
    if (user.role !== "user") {
      notify.info("Only individual members can request to join communities.");
      return;
    }
    setJoinLoading(true);
    try {
      await joinCommunity(id);
      setJoinSent(true);
      notify.success("Join request sent");
    } catch (err) {
      const message = getErrorMessage(err);
      if (message.toLowerCase().includes("already")) {
        setJoinSent(true);
        notify.info("You already have a pending or active membership.");
      } else {
        notify.error(message);
      }
    } finally {
      setJoinLoading(false);
    }
  };

  const showJoinButton =
    !authLoading &&
    (!user || user.role === "user") &&
    (!membership || membership.status === "pending");

  const isCommunityAdmin =
    membership?.role === "admin" && membership?.status === "approved";

  const verificationStatus =
    community?.verification_status ??
    (community?.status === "approved" ? "verified" : community?.status);

  if (loading) return <LoadingState />;
  if (!community) return <EmptyState title="Community not found" />;

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <BackButton fallbackHref="/communities" label="Back to communities" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <CommunityAvatar name={community.name} imageUrl={community.image_url} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-extrabold">{community.name}</h1>
            <p className="text-muted">{community.description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {community.location && <Badge variant="info">{community.location}</Badge>}
              <Badge variant="completed">★ {community.reputation_score.toFixed(1)} reputation</Badge>
              <StatusBadge
                status={verificationStatus === "verified" ? "approved" : verificationStatus || "pending"}
                kind="community"
              />
            </div>
          </div>
        </div>
        {showJoinButton && (
          <Button
            variant="gradient"
            size="sm"
            className="shrink-0 rounded-full"
            disabled={joinSent || joinLoading || membership?.status === "pending"}
            onClick={handleRequestJoin}
          >
            {joinSent || membership?.status === "pending"
              ? "Request Sent"
              : user
                ? "Request to Join"
                : "Sign in to Join"}
          </Button>
        )}
      </div>

      {isCommunityAdmin && verificationStatus === "rejected" && (
        <Card className="border-destructive/30 bg-destructive/10 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
            <div className="space-y-1 text-sm">
              <p className="font-bold text-foreground">Community verification rejected</p>
              {community.rejection_reason?.trim() ? (
                <p className="text-muted">{community.rejection_reason}</p>
              ) : (
                <p className="text-muted">No rejection reason was provided.</p>
              )}
              <p className="text-muted">
                Your community must be verified by a platform admin before it can browse or apply to
                jobs.
              </p>
            </div>
          </div>
        </Card>
      )}

      {isCommunityAdmin && verificationStatus === "pending" && (
        <Card className="border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
            <p className="text-sm text-foreground">
              Your community must be verified by a platform admin before it can browse or apply to
              jobs.
            </p>
          </div>
        </Card>
      )}

      <div>
        <h2 className="mb-4 text-xl font-bold">Members</h2>
        {community.members && community.members.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {sortMembersAdminFirst(community.members).map((m) =>
              m.user ? (
                <MemberCardPanel
                  key={m.id}
                  user={m.user}
                  skills={m.user.user_skills}
                  role={m.role}
                  detailHref={communityMemberDetailPath(id, m.id, "public")}
                />
              ) : null
            )}
          </div>
        ) : (
          <EmptyState title="No members yet" />
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold">Open Calls</h2>
        {openCalls.length === 0 ? (
          <EmptyState title="No open calls" />
        ) : (
          openCalls.map((oc) => (
            <Card key={oc.id} className="mb-2">
              <p className="font-bold">{oc.title}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {oc.skills && oc.skills.length > 0 ? (
                  oc.skills.map(
                    (s) =>
                      s.skill?.name && (
                        <Badge key={s.id} variant="info">
                          {s.skill.name}
                        </Badge>
                      )
                  )
                ) : (
                  <span className="text-sm text-muted">Open recruitment</span>
                )}
              </div>
              <Badge variant="open" className="mt-2">
                {oc.status}
              </Badge>
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
