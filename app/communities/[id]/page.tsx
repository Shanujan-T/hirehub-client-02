"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { BackButton } from "@/components/back-button";
import { CommunityAvatar } from "@/components/community-avatar";
import { MemberCardPanel, sortMembersAdminFirst } from "@/components/member-card";
import { StatusBadge } from "@/components/status-badge";
import { communityMemberDetailPath } from "@/lib/member-detail-paths";
import { Badge, Button, Card, Label, Textarea } from "@/components/ui";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { EmptyState, LoadingState } from "@/components/page-states";
import { useAsyncItem } from "@/lib/hooks/use-async";
import { appendReturnTo } from "@/lib/navigation";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  getCommunity,
  getCommunityReviewDigest,
  getMyMemberships,
  getOpenCalls,
  joinCommunity,
} from "@/services/community";
import { getMyJobs, getJobApplicants, inviteCommunityToJob } from "@/services/job";
import type { CommunityMember, OpenCall } from "@/types/community";
import type { Job } from "@/types/job";
import { AlertCircle, AlertTriangle, CheckCircle2, Mail } from "lucide-react";

function ApplyOpenCallModal({
  open,
  title,
  note,
  submitting,
  onNoteChange,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  note: string;
  submitting: boolean;
  onNoteChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, submitting]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6" role="presentation">
      <button
        type="button"
        aria-label="Dismiss dialog"
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
        onClick={onClose}
        disabled={submitting}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-open-call-title"
        className="relative z-[1] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xl dark:border-white/10 dark:bg-[#0f1729]"
      >
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
        <h2 id="apply-open-call-title" className="text-lg font-extrabold text-foreground">
          Apply to {title}
        </h2>
        <p className="mt-2 text-sm text-muted">
          Add an optional note for the community admin reviewing your application.
        </p>
        <div className="mt-4 space-y-2">
          <Label htmlFor="apply-open-call-note">Note (optional)</Label>
          <Textarea
            id="apply-open-call-note"
            rows={4}
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="Why you want to join this open call…"
            disabled={submitting}
          />
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" variant="gradient" size="sm" className="rounded-full" onClick={onSubmit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit application"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function InviteToJobModal({
  open,
  communityName,
  jobs,
  loadingJobs,
  submitting,
  invitedJobIds,
  selectedJobId,
  onSelectJob,
  onClose,
  onConfirm,
}: {
  open: boolean;
  communityName: string;
  jobs: Job[];
  loadingJobs: boolean;
  submitting: boolean;
  invitedJobIds: Set<number>;
  selectedJobId: number | null;
  onSelectJob: (id: number) => void;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, submitting]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6" role="presentation">
      <button
        type="button"
        aria-label="Dismiss dialog"
        className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
        onClick={onClose}
        disabled={submitting}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invite-to-job-title"
        className="relative z-[1] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xl dark:border-white/10 dark:bg-[#0f1729]"
      >
        <div aria-hidden className="absolute inset-x-0 top-0 h-1 bg-brand-gradient" />
        <h2 id="invite-to-job-title" className="text-lg font-extrabold text-foreground">
          Invite {communityName} to a job
        </h2>
        <p className="mt-2 text-sm text-muted">
          Choose one of your open jobs in this community’s category. They must accept before a
          contract is created.
        </p>
        <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
          {loadingJobs ? (
            <p className="text-sm text-muted">Loading your open jobs…</p>
          ) : jobs.length === 0 ? (
            <div className="rounded-xl border border-border/70 bg-background/40 p-3 text-sm">
              <p className="text-foreground">
                You don&apos;t have any open jobs in this community&apos;s category yet.
              </p>
              <Link href="/jobs/new" className="mt-2 inline-block font-semibold text-info hover:underline">
                Post a Job
              </Link>
            </div>
          ) : (
            jobs.map((job) => {
              const alreadyInvited = invitedJobIds.has(job.id);
              return (
                <button
                  key={job.id}
                  type="button"
                  disabled={alreadyInvited || submitting}
                  onClick={() => onSelectJob(job.id)}
                  className={`flex w-full items-start justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition ${
                    selectedJobId === job.id
                      ? "border-info bg-info/10"
                      : "border-border/70 bg-background/40 hover:border-info/50"
                  } ${alreadyInvited ? "opacity-60" : ""}`}
                >
                  <span>
                    <span className="font-semibold text-foreground">{job.title}</span>
                    <span className="mt-0.5 block text-xs text-muted">
                      {job.location} · ${job.final_price}
                    </span>
                  </span>
                  {alreadyInvited && (
                    <Badge variant="info" className="shrink-0 normal-case">
                      Invited
                    </Badge>
                  )}
                </button>
              );
            })
          )}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="gradient"
            size="sm"
            className="rounded-full"
            onClick={onConfirm}
            disabled={submitting || !selectedJobId || jobs.length === 0}
          >
            {submitting ? "Sending…" : "Send invitation"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function CommunityDetailContent() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);
  const { user, loading: authLoading } = useAuth();
  const { data: community, loading } = useAsyncItem(useCallback(() => getCommunity(id), [id]));
  const [openCalls, setOpenCalls] = useState<OpenCall[]>([]);
  const [membership, setMembership] = useState<CommunityMember | null>(null);
  const [reviewDigest, setReviewDigest] = useState<{
    praised: string[];
    flagged: string[];
  } | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinSent, setJoinSent] = useState(false);
  const [showNoSkillsDialog, setShowNoSkillsDialog] = useState(false);
  const [applyTarget, setApplyTarget] = useState<OpenCall | null>(null);
  const [applyNote, setApplyNote] = useState("");
  const [applySubmitting, setApplySubmitting] = useState(false);
  const [appliedOpenCallIds, setAppliedOpenCallIds] = useState<Set<number>>(new Set());
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteJobs, setInviteJobs] = useState<Job[]>([]);
  const [inviteJobsLoading, setInviteJobsLoading] = useState(false);
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [selectedInviteJobId, setSelectedInviteJobId] = useState<number | null>(null);
  const [invitedJobIds, setInvitedJobIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (id) {
      getOpenCalls(id)
        .then((rows) => setOpenCalls(rows.filter((oc) => oc.status === "open")))
        .catch(() => {});
      getCommunityReviewDigest(id)
        .then((digest) => {
          if (
            digest?.available &&
            ((digest.praised?.length ?? 0) > 0 || (digest.flagged?.length ?? 0) > 0)
          ) {
            setReviewDigest({
              praised: digest.praised ?? [],
              flagged: digest.flagged ?? [],
            });
          } else {
            setReviewDigest(null);
          }
        })
        .catch(() => setReviewDigest(null));
    }
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

  const hasSkills = user?.user_skills !== undefined ? user.user_skills.length > 0 : true;

  const handleRequestJoin = async () => {
    if (!user) {
      router.push(appendReturnTo("/auth/login", `/communities/${id}`));
      return;
    }
    if (!hasSkills) {
      setShowNoSkillsDialog(true);
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

  const handleApplyOpenCall = async (note: string) => {
    if (!applyTarget) return;
    if (!user) {
      router.push(appendReturnTo("/auth/login", `/communities/${id}`));
      return;
    }
    if (user.role !== "user") {
      notify.info("Only individual members can apply to open calls.");
      return;
    }
    setApplySubmitting(true);
    try {
      await joinCommunity(id);
      setAppliedOpenCallIds((prev) => new Set(prev).add(applyTarget.id));
      setJoinSent(true);
      setMembership((prev) =>
        prev ??
        ({
          id: 0,
          community_id: id,
          user_id: user.id,
          role: "member",
          status: "pending",
        } satisfies CommunityMember)
      );
      if (note.trim()) {
        notify.info("Application sent — your note was not stored (join request only).");
      } else {
        notify.success("Application sent");
      }
      setApplyTarget(null);
      setApplyNote("");
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setApplySubmitting(false);
    }
  };

  const openInviteDialog = async () => {
    if (!user) {
      router.push(appendReturnTo("/auth/login", `/communities/${id}`));
      return;
    }
    if (!community?.category_id) {
      notify.error("This community has no category set.");
      return;
    }
    setInviteOpen(true);
    setSelectedInviteJobId(null);
    setInviteJobsLoading(true);
    try {
      const jobs = await getMyJobs({ category_id: community.category_id, status: "open" });
      setInviteJobs(jobs);
      const invited = new Set<number>();
      await Promise.all(
        jobs.map(async (job) => {
          try {
            const apps = await getJobApplicants(job.id);
            if (apps.some((a) => a.community_id === id)) {
              invited.add(job.id);
            }
          } catch {
            /* ignore per-job lookup failures */
          }
        })
      );
      setInvitedJobIds(invited);
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to load your open jobs"));
      setInviteJobs([]);
    } finally {
      setInviteJobsLoading(false);
    }
  };

  const handleInviteConfirm = async () => {
    if (!selectedInviteJobId) return;
    setInviteSubmitting(true);
    try {
      await inviteCommunityToJob(selectedInviteJobId, id);
      setInvitedJobIds((prev) => new Set(prev).add(selectedInviteJobId));
      notify.success("Invitation sent");
      setInviteOpen(false);
      setSelectedInviteJobId(null);
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to send invitation"));
    } finally {
      setInviteSubmitting(false);
    }
  };

  const isApprovedMember = membership?.status === "approved";
  const hasPendingRequest = membership?.status === "pending" || joinSent;
  const isCommunityAdmin =
    membership?.role === "admin" && membership?.status === "approved";

  const showJoinButton =
    !authLoading &&
    (!user || user.role === "user") &&
    !isApprovedMember;

  // Job posters are platform "user" accounts; hide invite when viewing as this community's admin.
  const showInviteButton =
    !authLoading && Boolean(user) && user?.role === "user" && !isCommunityAdmin;

  const verificationStatus =
    community?.status === "approved" ? "verified" : community?.status;

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
            {reviewDigest && (
              <div className="mt-4 rounded-2xl border border-border/70 bg-card/60 p-4">
                <p className="mb-3 text-sm font-bold text-foreground">What people say</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Commonly praised
                    </p>
                    <ul className="space-y-1.5">
                      {reviewDigest.praised.map((phrase) => (
                        <li key={phrase} className="flex items-start gap-2 text-sm text-foreground">
                          <CheckCircle2
                            className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                            aria-hidden
                          />
                          <span>{phrase}</span>
                        </li>
                      ))}
                      {reviewDigest.praised.length === 0 && (
                        <li className="text-sm text-muted">No recurring praise yet.</li>
                      )}
                    </ul>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                      Worth noting
                    </p>
                    <ul className="space-y-1.5">
                      {reviewDigest.flagged.map((phrase) => (
                        <li key={phrase} className="flex items-start gap-2 text-sm text-foreground">
                          <AlertCircle
                            className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400"
                            aria-hidden
                          />
                          <span>{phrase}</span>
                        </li>
                      ))}
                      {reviewDigest.flagged.length === 0 && (
                        <li className="text-sm text-muted">No recurring concerns noted.</li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {showInviteButton && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={() => void openInviteDialog()}
            >
              <Mail className="mr-1.5 h-3.5 w-3.5" aria-hidden />
              Invite to a job
            </Button>
          )}
          {showJoinButton && (
            <Button
              variant="gradient"
              size="sm"
              className="rounded-full"
              disabled={hasPendingRequest || joinLoading}
              onClick={handleRequestJoin}
            >
              {hasPendingRequest ? "Request Sent" : user ? "Request to Join" : "Sign in to Join"}
            </Button>
          )}
        </div>
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
          openCalls.map((oc) => {
            const applied =
              appliedOpenCallIds.has(oc.id) || hasPendingRequest;
            const showApply = (!user || user.role === "user") && !isApprovedMember;

            return (
              <Card key={oc.id} className="mb-2 flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
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
                </div>
                {showApply && (
                  <Button
                    variant={applied ? "outline" : "gradient"}
                    size="sm"
                    className="shrink-0 rounded-full"
                    disabled={applied || applySubmitting}
                    onClick={() => {
                      if (!user) {
                        router.push(appendReturnTo("/auth/login", `/communities/${id}`));
                        return;
                      }
                      setApplyTarget(oc);
                    }}
                  >
                    {applied ? "Applied" : user ? "Apply" : "Sign in to Apply"}
                  </Button>
                )}
              </Card>
            );
          })
        )}
      </div>

      <ApplyOpenCallModal
        open={Boolean(applyTarget)}
        title={applyTarget?.title ?? ""}
        note={applyNote}
        submitting={applySubmitting}
        onNoteChange={setApplyNote}
        onClose={() => {
          if (!applySubmitting) {
            setApplyTarget(null);
            setApplyNote("");
          }
        }}
        onSubmit={() => void handleApplyOpenCall(applyNote)}
      />

      <InviteToJobModal
        open={inviteOpen}
        communityName={community.name}
        jobs={inviteJobs}
        loadingJobs={inviteJobsLoading}
        submitting={inviteSubmitting}
        invitedJobIds={invitedJobIds}
        selectedJobId={selectedInviteJobId}
        onSelectJob={setSelectedInviteJobId}
        onClose={() => {
          if (!inviteSubmitting) {
            setInviteOpen(false);
            setSelectedInviteJobId(null);
          }
        }}
        onConfirm={() => void handleInviteConfirm()}
      />
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
