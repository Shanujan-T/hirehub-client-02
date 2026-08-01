"use client";

import { Suspense, useCallback, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { notify } from "@/lib/notify";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, adminNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { MemberCard, sortMembersAdminFirst } from "@/components/member-card";
import { cn, getErrorMessage } from "@/lib/utils";
import { Button, Card, Label, Textarea } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getCommunities, getCommunity, verifyCommunity } from "@/services/community";
import type { Community } from "@/types/community";

function formatCreatedDate(iso: string | undefined | null): string {
  if (!iso) return "Unknown";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function memberCountLabel(count: number): string {
  return count === 1 ? "1 member" : `${count} members`;
}

function CommunityReviewCard({
  community,
  onReviewed,
}: {
  community: Community;
  onReviewed: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [details, setDetails] = useState<Community | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadDetails = async () => {
    if (details) {
      setExpanded((value) => !value);
      return;
    }
    setLoadingDetails(true);
    try {
      const full = await getCommunity(community.id);
      setDetails(full);
      setExpanded(true);
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to load community details"));
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleVerify = async (verification_status: "verified" | "rejected") => {
    setSubmitting(true);
    try {
      await verifyCommunity(community.id, {
        verification_status,
        reason: verification_status === "rejected" ? reason.trim() || undefined : undefined,
      });
      notify.success(verification_status === "verified" ? "Community approved" : "Community rejected");
      onReviewed();
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const data = details ?? community;
  const memberCount = data.members?.length ?? data.member_count ?? 0;

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">{community.name}</p>
          <p className="text-sm text-muted">{community.location ?? "No location listed"}</p>
          <p className="mt-1 text-xs text-muted">{memberCountLabel(memberCount)}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={community.status} kind="community" />
          <Button type="button" variant="outline" size="sm" onClick={loadDetails} disabled={loadingDetails}>
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {loadingDetails ? "Loading..." : expanded ? "Hide" : "Review"}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-4 border-t border-border pt-4 text-sm">
          <div className="space-y-2">
            <p>
              <span className="font-medium">About:</span>{" "}
              {data.description?.trim() ? data.description : "No description provided."}
            </p>
            <p>
              <span className="font-medium">Location:</span>{" "}
              {data.location?.trim() ? data.location : "Not specified"}
            </p>
            <p>
              <span className="font-medium">Created:</span> {formatCreatedDate(data.created_at)}
            </p>
          </div>

          {data.admin_user && (
            <div className="rounded-lg border border-border bg-background/60 p-3">
              <p className="font-medium">Community admin</p>
              <p>{data.admin_user.full_name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge status={data.admin_user.identity_status} kind="account" />
              </div>
            </div>
          )}

          <div className="space-y-3">
            <p className="font-medium">{memberCountLabel(memberCount)}</p>
            {data.members && data.members.length > 0 ? (
              <div className="space-y-2">
                {sortMembersAdminFirst(data.members).map((membership) =>
                  membership.user ? (
                    <Card
                      key={membership.id}
                      className={cn(
                        "p-3",
                        membership.role === "admin" &&
                          "border-secondary/40 bg-secondary/[0.04] dark:border-secondary/50 dark:bg-secondary/10"
                      )}
                    >
                      <MemberCard user={membership.user} role={membership.role} />
                    </Card>
                  ) : (
                    <Card key={membership.id} className="p-3">
                      <p className="font-medium">{`User #${membership.user_id}`}</p>
                    </Card>
                  )
                )}
              </div>
            ) : (
              <p className="text-muted">No approved members yet.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`reject-reason-${community.id}`}>Rejection reason (optional)</Label>
            <Textarea
              id={`reject-reason-${community.id}`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Required context if rejecting"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="gradient"
              size="sm"
              className="rounded-full"
              disabled={submitting}
              onClick={() => handleVerify("verified")}
            >
              Approve
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => handleVerify("rejected")}
            >
              Reject
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

function AdminCommunitiesContent() {
  const { data: communities, loading, reload } = useAsyncList(
    useCallback(() => getCommunities({ status: "pending" }), [])
  );

  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <PortalShell title="Community Reviews" subtitle="Pending community verification queue" navItems={adminNav}>
        {loading ? (
          <LoadingState />
        ) : communities.length === 0 ? (
          <EmptyState title="No pending communities" />
        ) : (
          <div className="space-y-3">
            {communities.map((community) => (
              <CommunityReviewCard key={community.id} community={community} onReviewed={reload} />
            ))}
          </div>
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}

export default function AdminCommunitiesPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AdminCommunitiesContent />
    </Suspense>
  );
}
