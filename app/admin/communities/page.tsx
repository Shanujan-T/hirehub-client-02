"use client";

import { Suspense, useCallback, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { notify } from "@/lib/notify";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, adminNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card, Label, Textarea } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getErrorMessage } from "@/lib/utils";
import { getCommunities, getCommunity, reviewCommunity } from "@/services/community";
import { reviewIdentityVerification } from "@/services/user";
import type { Community } from "@/types/community";

const EXPERIENCE_LABELS: Record<string, string> = {
  less_than_1_year: "Less than 1 year",
  "1_to_3_years": "1–3 years",
  "3_plus_years": "3+ years",
};

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

  const handleReview = async (approve: boolean) => {
    setSubmitting(true);
    try {
      await reviewCommunity(community.id, {
        approve,
        reason: approve ? undefined : reason.trim() || undefined,
      });
      notify.success(approve ? "Community approved" : "Community rejected");
      onReviewed();
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleIdentityReview = async (approve: boolean) => {
    if (!data.admin_user) return;
    setSubmitting(true);
    try {
      await reviewIdentityVerification(data.admin_user.id, {
        approve,
        reason: approve ? undefined : reason.trim() || undefined,
      });
      notify.success(approve ? "Identity approved" : "Identity rejected");
      const full = await getCommunity(community.id);
      setDetails(full);
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const data = details ?? community;

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold">{community.name}</p>
          <p className="text-sm text-muted">{community.location}</p>
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
        <div className="space-y-3 border-t border-border pt-3 text-sm">
          <p><span className="font-medium">Category:</span> {data.category?.name ?? `#${data.category_id}`}</p>
          <p><span className="font-medium">Experience:</span> {EXPERIENCE_LABELS[data.experience_level] ?? data.experience_level}</p>
          {data.specialization && <p><span className="font-medium">Specialization:</span> {data.specialization}</p>}
          {data.admin_bio && <p><span className="font-medium">Admin bio:</span> {data.admin_bio}</p>}
          {data.contact_phone && <p><span className="font-medium">Contact:</span> {data.contact_phone}</p>}
          {data.description && <p><span className="font-medium">Description:</span> {data.description}</p>}
          {!!data.portfolio_links?.length && (
            <div>
              <p className="font-medium">Portfolio links</p>
              <ul className="list-disc pl-5">
                {data.portfolio_links.map((link) => (
                  <li key={link}>
                    <a href={link} target="_blank" rel="noreferrer" className="text-info hover:underline">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.admin_user && (
            <div className="rounded-lg border border-border bg-background/60 p-3">
              <p className="font-medium">Community admin</p>
              <p>{data.admin_user.full_name}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusBadge status={data.admin_user.identity_status} kind="identity" />
                {data.admin_user.nic_masked && (
                  <span className="text-xs text-muted">NIC: {data.admin_user.nic_masked}</span>
                )}
              </div>
              {data.admin_user.nic_document_url && (
                <a
                  href={data.admin_user.nic_document_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-info hover:underline"
                >
                  View NIC document
                </a>
              )}
              {data.admin_user.identity_status === "pending" && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => handleIdentityReview(true)}
                  >
                    Approve identity
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={submitting}
                    onClick={() => handleIdentityReview(false)}
                  >
                    Reject identity
                  </Button>
                </div>
              )}
            </div>
          )}

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
              onClick={() => handleReview(true)}
            >
              Approve
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={submitting}
              onClick={() => handleReview(false)}
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
