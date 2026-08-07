"use client";

import Link from "next/link";
import { Suspense, useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Pencil, X } from "lucide-react";
import {
  CommunityAdminRoute,
  useCommunityAdmin,
} from "@/components/community-admin-route";
import { CommunityAvatar } from "@/components/community-avatar";
import { CommunityDetailField } from "@/components/community-detail-field";
import { ImageUploadControl } from "@/components/image-upload-control";
import { MemberCard } from "@/components/member-card";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { Badge, Button, Card, Input, Label, Textarea } from "@/components/ui";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { communityMemberDetailPath } from "@/lib/member-detail-paths";
import { buildFilteredPath } from "@/lib/navigation";
import { notify } from "@/lib/notify";
import { editCommunitySchema, type EditCommunityForm } from "@/lib/schemas";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  getCommunity,
  getCommunityMembers,
  MIN_COMMUNITY_MEMBERS,
  removeCommunityMember,
  updateCommunity,
  uploadCommunityImage,
} from "@/services/community";
import type { Community, CommunityMember } from "@/types/community";

const formValuesFromCommunity = (next: Community): EditCommunityForm => ({
  name: next.name,
  description: next.description ?? "",
  location: next.location ?? "",
});

function MyCommunityContent() {
  const { user, updateUser, refreshUser } = useAuth();
  const { communityId } = useCommunityAdmin();
  const { hrefWithReturn, getFilter } = useListNavigation();
  const tab = getFilter("tab", "members");
  const [community, setCommunity] = useState<Community | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [pending, setPending] = useState<CommunityMember[]>([]);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [editingDetails, setEditingDetails] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EditCommunityForm>({
    resolver: zodResolver(editCommunitySchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
    },
  });

  const reload = useCallback(
    async (cid: number) => {
      const next = await getCommunity(cid);
      setCommunity(next);
      reset(formValuesFromCommunity(next));
      setEditingDetails(false);
      setMembers(await getCommunityMembers(cid, "approved"));
      setPending(await getCommunityMembers(cid, "pending"));
    },
    [reset],
  );

  useEffect(() => {
    if (communityId)
      reload(communityId).catch(() => notify.error("Failed to load members"));
  }, [communityId, reload]);

  const syncAuthCommunity = (updated: Community) => {
    if (!user?.community_memberships) return;
    updateUser({
      ...user,
      community_memberships: user.community_memberships.map((membership) => {
        if (membership.community_id !== updated.id) return membership;
        return {
          ...membership,
          community: {
            ...(membership.community ?? {
              id: updated.id,
              name: updated.name,
              status: updated.status,
            }),
            id: updated.id,
            name: updated.name,
            status: updated.status,
            rejection_reason: updated.rejection_reason,
            category: updated.category,
            experience_level: updated.experience_level,
            location: updated.location,
            image_url: updated.image_url,
          },
        };
      }),
    });
  };

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

  const startEditing = () => {
    if (!community) return;
    reset(formValuesFromCommunity(community));
    setEditingDetails(true);
  };

  const cancelEditing = () => {
    if (!community) return;
    reset(formValuesFromCommunity(community));
    setEditingDetails(false);
  };

  const onSaveDetails = async (data: EditCommunityForm) => {
    if (!communityId) return;
    setSaving(true);
    try {
      const updated = await updateCommunity(communityId, {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        location: data.location.trim(),
      });

      setCommunity(updated);
      reset(formValuesFromCommunity(updated));
      setEditingDetails(false);
      syncAuthCommunity(updated);
      void refreshUser();
      notify.success("Community details saved");
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to save community details"));
    } finally {
      setSaving(false);
    }
  };

  const handleCommunityImageUpload = async (file: File) => {
    if (!communityId) return;
    setUploadingImage(true);
    try {
      const updated = await uploadCommunityImage(communityId, file);
      setCommunity(updated);
      syncAuthCommunity(updated);
      void refreshUser();
      notify.success("Community image updated");
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to upload community image"));
      throw err;
    } finally {
      setUploadingImage(false);
    }
  };

  const pendingListHref = buildFilteredPath("/community-admin/my-community", {
    tab: "pending",
  });
  const belowMinimum =
    tab === "members" && members.length < MIN_COMMUNITY_MEMBERS;

  return (
    <CommunityAdminRoute>
      <DashboardPortalShell
        title="My Community"
        subtitle="Approve or reject join requests"
      >
        {community && (
          <Card className="mb-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-foreground">
                  Community Details
                </h2>
                <p className="text-sm text-muted">
                  {editingDetails
                    ? "Edit how your community appears and where it matches jobs."
                    : "How your community appears and where it matches jobs."}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {community.status && (
                  <StatusBadge status={community.status} kind="community" />
                )}
                {editingDetails ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    aria-label="Cancel editing"
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    <X className="h-4 w-4" aria-hidden />
                    <span className="ml-1.5">Cancel</span>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    aria-label="Edit community details"
                    onClick={startEditing}
                  >
                    <Pencil className="h-4 w-4" aria-hidden />
                  </Button>
                )}
              </div>
            </div>

            {editingDetails ? (
              <form
                onSubmit={handleSubmit(onSaveDetails)}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="community-name">Name</Label>
                  <Input
                    id="community-name"
                    {...register("name")}
                    autoComplete="organization"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="community-description">Description</Label>
                  <Textarea
                    id="community-description"
                    rows={4}
                    placeholder="Optional — what your community does best"
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="community-location">Location</Label>
                  <Input
                    id="community-location"
                    placeholder="City or region"
                    {...register("location")}
                  />
                  {errors.location && (
                    <p className="text-xs text-destructive">
                      {errors.location.message}
                    </p>
                  )}
                  <p className="text-xs text-muted">
                    Changing location may affect which jobs your community is
                    matched to.
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="gradient"
                  className="rounded-full"
                  disabled={saving || !isDirty}
                >
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <CommunityDetailField label="Name" value={community.name} />
                <CommunityDetailField
                  label="Description"
                  value={community.description?.trim() || "No description yet."}
                />
                <CommunityDetailField
                  label="Location"
                  value={community.location?.trim() || "No location set."}
                />
              </div>
            )}

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
          <Link
            href={buildFilteredPath("/community-admin/my-community", {
              tab: "members",
            })}
          >
            <Button
              variant={tab === "members" ? "gradient" : "outline"}
              size="sm"
              className="rounded-full"
            >
              Members ({members.length})
            </Button>
          </Link>
          <Link href={pendingListHref}>
            <Button
              variant={tab === "pending" ? "gradient" : "outline"}
              size="sm"
              className="rounded-full"
            >
              Pending ({pending.length})
            </Button>
          </Link>
        </div>

        {belowMinimum && (
          <Card className="mb-4 border-amber-500/30 bg-amber-500/10 p-4">
            <div className="flex gap-3">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400"
                aria-hidden
              />
              <p className="text-sm text-foreground">
                This community no longer meets the {MIN_COMMUNITY_MEMBERS}
                -member minimum and won&apos;t appear in new job listings until
                it does.
              </p>
            </div>
          </Card>
        )}

        {tab === "pending" ? (
          pending.length === 0 ? (
            <p className="text-muted">No pending join requests.</p>
          ) : (
            pending.map((m) => (
              <Card
                key={m.id}
                className="mb-2 flex flex-wrap items-center justify-between gap-2 p-4"
              >
                <span>{m.user?.full_name ?? `User #${m.user_id}`}</span>
                <div className="flex items-center gap-2">
                  <StatusBadge status="pending" kind="member" />
                  <Link
                    href={hrefWithReturn(
                      `/community-admin/my-community/pending/${m.id}`,
                    )}
                  >
                    <Button variant="outline" size="sm">
                      Review Request
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )
        ) : members.length === 0 ? (
          <p className="text-muted">No approved members yet.</p>
        ) : (
          members.map((m) => {
            const isSelf = m.user_id === user?.id;
            return (
              <Card key={m.id} className="mb-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    {m.user ? (
                      <MemberCard
                        user={m.user}
                        nameHref={hrefWithReturn(
                          communityMemberDetailPath(
                            communityId!,
                            m.id,
                            "admin",
                          ),
                        )}
                      />
                    ) : (
                      <p className="font-bold">{`User #${m.user_id}`}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {m.role === "admin" ? (
                      <Badge variant="active">Admin</Badge>
                    ) : (
                      <StatusBadge status="approved" kind="member" />
                    )}
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
      </DashboardPortalShell>
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
