"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { CommunityAvatar } from "@/components/community-avatar";
import { ImageUploadControl } from "@/components/image-upload-control";
import { MemberCard, sortMembersAdminFirst } from "@/components/member-card";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { Badge, Button, Card } from "@/components/ui";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { communityMemberDetailPath } from "@/lib/member-detail-paths";
import { buildFilteredPath } from "@/lib/navigation";
import { notify } from "@/lib/notify";
import { cn, getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  analyzeJoinRequestFit,
  getCommunity,
  getCommunityMembers,
  MIN_COMMUNITY_MEMBERS,
  removeCommunityMember,
  uploadCommunityImage,
  type JoinRequestFitAnalysis,
} from "@/services/community";
import type { Community, CommunityMember } from "@/types/community";

function PendingFitPanel({
  communityId,
  membership,
}: {
  communityId: number;
  membership: CommunityMember;
}) {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<JoinRequestFitAnalysis | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [opened, setOpened] = useState(false);

  const handleAnalyze = async () => {
    if (loading) return;
    setLoading(true);
    setUnavailable(false);
    try {
      const result = await analyzeJoinRequestFit(communityId, membership.user_id);
      if (!result.available || !result.analysis) {
        setUnavailable(true);
        setAnalysis(null);
      } else {
        setAnalysis(result.analysis);
        setOpened(true);
      }
    } catch {
      setUnavailable(true);
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-3 space-y-2 border-t border-border/60 pt-3">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full"
        disabled={loading}
        onClick={() => void handleAnalyze()}
      >
        <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden />
        {loading ? "Analyzing…" : analysis ? "Refresh Fit Analysis" : "Analyze Fit"}
      </Button>

      {unavailable && (
        <p className="text-xs text-muted">AI suggestion unavailable — approve or reject as usual.</p>
      )}

      {opened && analysis && (
        <div className="space-y-2 rounded-xl border border-secondary/20 bg-secondary/[0.04] p-3 dark:bg-secondary/10">
          <p className="text-xs font-bold uppercase tracking-wide text-secondary">AI Fit Analysis</p>
          <p className="text-sm leading-relaxed text-foreground">{analysis.fit_summary}</p>
          {analysis.new_skills_added.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-success">Adds:</span>
              {analysis.new_skills_added.map((skill) => (
                <Badge key={`new-${skill}`} variant="completed" className="normal-case">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
          {analysis.overlap_skills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-info">Overlaps:</span>
              {analysis.overlap_skills.map((skill) => (
                <Badge key={`overlap-${skill}`} variant="info" className="normal-case">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
          <p className="text-[11px] text-muted">Assistive only — your Approve/Reject decision is final.</p>
        </div>
      )}
    </div>
  );
}

function MyCommunityContent() {
  const { user } = useAuth();
  const { communityId } = useCommunityAdmin();
  const { hrefWithReturn, getFilter } = useListNavigation();
  const tab = getFilter("tab", "members");
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [pending, setPending] = useState<CommunityMember[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const reload = async (cid: number) => {
    setCommunity(await getCommunity(cid));
    setMembers(await getCommunityMembers(cid, "approved"));
    setPending(await getCommunityMembers(cid, "pending"));
  };

  useEffect(() => {
    if (communityId) reload(communityId).catch(() => notify.error("Failed to load members"));
  }, [communityId]);

  const handleRemove = async (member: CommunityMember) => {
    const name = member.user?.full_name ?? `User #${member.user_id}`;
    if (!window.confirm(`Remove ${name} from this community?`)) return;

    setRemovingId(member.id);
    try {
      await removeCommunityMember(member.id);
      notify.success(`${name} removed from the community`);
      if (communityId) await reload(communityId);
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setRemovingId(null);
    }
  };

  const pendingListHref = buildFilteredPath("/community-admin/my-community", { tab: "pending" });
  const belowMinimum = tab === "members" && members.length < MIN_COMMUNITY_MEMBERS;

  const handleCommunityImageUpload = async (file: File) => {
    if (!communityId) return;
    setUploadingImage(true);
    try {
      const updated = await uploadCommunityImage(communityId, file);
      setCommunity(updated);
      notify.success("Community image updated");
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to upload community image"));
      throw err;
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <CommunityAdminRoute>
      <PortalShell title="My Community" subtitle="Approve or reject join requests" navItems={communityAdminNav}>
        {community && (
          <Card className="mb-6">
            <ImageUploadControl
              label="Community image"
              shape="rounded"
              previewUrl={community.image_url}
              uploading={uploadingImage}
              onUpload={handleCommunityImageUpload}
              fallback={
                <CommunityAvatar
                  name={community.name}
                  imageUrl={community.image_url}
                  size="lg"
                  className="h-24 w-24 sm:h-28 sm:w-28"
                />
              }
            />
          </Card>
        )}
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

        {belowMinimum && (
          <Card className="mb-4 border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden />
              <p className="text-sm text-foreground">
                This community no longer meets the {MIN_COMMUNITY_MEMBERS}-member minimum and won&apos;t appear
                in new job listings until it does.
              </p>
            </div>
          </Card>
        )}

        {tab === "pending" ? (
          pending.length === 0 ? (
            <p className="text-muted">No pending join requests.</p>
          ) : (
            pending.map((m) => (
              <Card key={m.id} className="mb-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {m.user ? (
                      <MemberCard user={m.user} skills={m.user.user_skills} />
                    ) : (
                      <span className="font-bold">{`User #${m.user_id}`}</span>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <StatusBadge status="pending" kind="member" />
                    <Link href={hrefWithReturn(`/community-admin/my-community/pending/${m.id}`)}>
                      <Button variant="outline" size="sm">
                        Review Request
                      </Button>
                    </Link>
                  </div>
                </div>
                {communityId && <PendingFitPanel communityId={communityId} membership={m} />}
              </Card>
            ))
          )
        ) : members.length === 0 ? (
          <p className="text-muted">No approved members yet.</p>
        ) : (
          sortMembersAdminFirst(members).map((m) => {
            const isSelf = m.user_id === user?.id;
            const isAdmin = m.role === "admin";
            return (
              <Card
                key={m.id}
                className={cn(
                  "mb-3 p-4",
                  isAdmin &&
                    "border-secondary/40 bg-secondary/[0.04] dark:border-secondary/50 dark:bg-secondary/10"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {m.user ? (
                      <MemberCard
                        user={m.user}
                        role={m.role}
                        nameHref={hrefWithReturn(
                          communityMemberDetailPath(communityId!, m.id, "admin")
                        )}
                      />
                    ) : (
                      <p className="font-bold">{`User #${m.user_id}`}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {isAdmin ? null : <StatusBadge status="approved" kind="member" />}
                    {!isSelf && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:border-destructive hover:text-destructive"
                        disabled={removingId === m.id}
                        onClick={() => void handleRemove(m)}
                      >
                        {removingId === m.id ? "Removing…" : "Remove"}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
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
