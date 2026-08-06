"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { notify } from "@/lib/notify";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { ImageUploadControl } from "@/components/image-upload-control";
import { LoadingState } from "@/components/page-states";
import { DashboardPortalShell } from "@/components/portal-shell";
import { UserAvatar } from "@/components/user-avatar";
import { Badge, Button, Card, Input, Label, SelectMenu, Textarea } from "@/components/ui";
import { Award, Wrench } from "lucide-react";
import { useScrollToAccountSection } from "@/lib/profile-account-scroll";
import { MY_COMMUNITIES_RETURN, safeReturnPath } from "@/lib/return-navigation";
import { useAuth } from "@/providers/auth-provider";
import { getErrorMessage } from "@/lib/utils";
import {
  createUserSkill,
  createWorkSample,
  getSkills,
  getUserSkillWithSamples,
  getUserSkills,
  updateUser,
  uploadWorkSampleImage,
} from "@/services/contract";
import { uploadUserAvatar } from "@/services/user";
import {
  addressPayloadForSave,
  ProfileLocationAddressFields,
  userAddressFromUser,
} from "@/components/profile-location-address-fields";
import { ProfileAccountVerificationSection } from "@/components/profile-account-verification-section";
import type { UserAddress } from "@/types/user";
import type { UserSkill, WorkSample } from "@/types/skill";

function MemberProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("returnTo"), MY_COMMUNITIES_RETURN);
  const { user, refreshUser, updateUser: setAuthUser } = useAuth();
  useScrollToAccountSection();
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState<UserAddress>({});
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [skills, setSkills] = useState<{ id: number; name: string }[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [newSkill, setNewSkill] = useState({ skill_id: "", level: "intermediate" });
  const [sampleSkillId, setSampleSkillId] = useState<number | null>(null);
  const [sampleText, setSampleText] = useState("");
  const [sampleBusy, setSampleBusy] = useState(false);
  const [sampleNote, setSampleNote] = useState<string | null>(null);
  const [latestSample, setLatestSample] = useState<WorkSample | null>(null);

  useEffect(() => {
    if (user?.identity_status === "verified" && searchParams.get("returnTo")) {
      router.replace(returnTo);
    }
  }, [user?.identity_status, returnTo, router, searchParams]);

  useEffect(() => {
    getSkills().then(setSkills).catch(() => notify.error("Failed to load skills"));
    if (user) {
      setFullName(user.full_name || "");
      setLocation(user.location || "");
      setAddress(userAddressFromUser(user));
      setBio(user.bio || "");
      getUserSkills(user.id).then(setUserSkills).catch(() => {});
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      notify.error("Full name is required");
      return;
    }
    setSaving(true);
    try {
      await updateUser(user.id, {
        full_name: trimmedName,
        location: location.trim() || null,
        bio,
        ...addressPayloadForSave(address),
      });
      await refreshUser();
      notify.success("Profile updated");
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    setUploadingAvatar(true);
    try {
      const updated = await uploadUserAvatar(user.id, file);
      setAuthUser(updated);
      notify.success("Profile picture updated");
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to upload profile picture"));
      throw err;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAddSkill = async () => {
    if (!user || !newSkill.skill_id) return;
    try {
      await createUserSkill({
        user_id: user.id,
        skill_id: Number(newSkill.skill_id),
        level: newSkill.level,
      });
      getUserSkills(user.id).then(setUserSkills);
      notify.success("Skill added");
    } catch (err) {
      notify.error(getErrorMessage(err));
    }
  };

  const refreshSkill = async (userSkillId: number) => {
    try {
      const updated = await getUserSkillWithSamples(userSkillId);
      setUserSkills((prev) => prev.map((s) => (s.id === userSkillId ? { ...s, ...updated } : s)));
      return updated;
    } catch {
      if (user) getUserSkills(user.id).then(setUserSkills);
      return null;
    }
  };

  const handleAddTextSample = async () => {
    if (!sampleSkillId || !sampleText.trim() || sampleBusy) return;
    setSampleBusy(true);
    setSampleNote(null);
    try {
      const result = await createWorkSample(sampleSkillId, {
        sample_type: "text",
        content: sampleText.trim(),
      });
      setLatestSample(result.work_sample);
      setSampleText("");
      await refreshSkill(sampleSkillId);
      if (result.message) setSampleNote(result.message);
      else if (result.work_sample.verification_status === "plausible") {
        notify.success("Work sample marked plausible — AI-reviewed badge unlocked");
      } else if (result.work_sample.verification_status === "unclear") {
        notify.info("Sample saved — AI marked it unclear");
      } else {
        notify.info("Sample saved as unreviewed");
      }
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to add work sample"));
    } finally {
      setSampleBusy(false);
    }
  };

  const handleAddImageSample = async (file: File) => {
    if (!sampleSkillId || sampleBusy) return;
    setSampleBusy(true);
    setSampleNote(null);
    try {
      const result = await uploadWorkSampleImage(sampleSkillId, file);
      setLatestSample(result.work_sample);
      await refreshSkill(sampleSkillId);
      if (result.vision_available === false || result.message) {
        setSampleNote(
          result.message ||
            "Image review temporarily unavailable — try a text description instead"
        );
      } else if (result.work_sample.verification_status === "plausible") {
        notify.success("Image sample reviewed as plausible");
      }
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to upload work sample"));
      throw err;
    } finally {
      setSampleBusy(false);
    }
  };

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell title="My Profile" subtitle="Account details, bio, and skills">
        <Card className="mx-auto max-w-lg space-y-6">
          <ImageUploadControl
            label="Profile picture"
            previewUrl={user?.avatar_url}
            uploading={uploadingAvatar}
            onUpload={handleAvatarUpload}
            fallback={
              <UserAvatar
                name={user?.full_name ?? "Member"}
                avatarUrl={user?.avatar_url}
                size="lg"
                className="h-24 w-24 text-lg"
              />
            }
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
            <ProfileLocationAddressFields
              location={location}
              onLocationChange={setLocation}
              address={address}
              onAddressFieldChange={(field, value) =>
                setAddress((prev) => ({ ...prev, [field]: value }))
              }
            />
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email ?? ""} readOnly disabled className="opacity-70" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} />
            <Button variant="gradient" className="rounded-full" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>

          <ProfileAccountVerificationSection returnTo={returnTo} />

          <div>
            <Label>Skills</Label>
            <ul className="mt-2 space-y-2 text-sm">
              {userSkills.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-2">
                  <Badge variant="info">
                    {s.skill?.name} — {s.level}
                  </Badge>
                  {s.ai_reviewed && (
                    <Badge variant="completed" className="text-[10px] normal-case">
                      AI-reviewed
                    </Badge>
                  )}
                  <button
                    type="button"
                    className="text-xs font-medium text-info hover:underline"
                    onClick={() => {
                      setSampleSkillId(s.id);
                      setSampleNote(null);
                      setLatestSample(null);
                    }}
                  >
                    Add work sample
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {sampleSkillId != null && (
            <div className="space-y-3 rounded-xl border border-border/70 bg-background/40 p-3">
              <p className="text-sm font-semibold">
                Work sample —{" "}
                {userSkills.find((s) => s.id === sampleSkillId)?.skill?.name ?? "skill"}
              </p>
              <div className="space-y-2">
                <Label htmlFor="sample-text">Text / description sample</Label>
                <Textarea
                  id="sample-text"
                  rows={4}
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  placeholder="Paste a short excerpt, code snippet, or description of your work…"
                  disabled={sampleBusy}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={sampleBusy || !sampleText.trim()}
                  onClick={() => void handleAddTextSample()}
                >
                  {sampleBusy ? "Submitting…" : "Submit text sample"}
                </Button>
              </div>
              <ImageUploadControl
                label="Or upload an image sample"
                uploading={sampleBusy}
                onUpload={handleAddImageSample}
                shape="rounded"
                fallback={
                  <div className="flex h-20 w-full items-center justify-center rounded-xl border border-dashed border-border text-xs text-muted">
                    Drop or choose an image
                  </div>
                }
              />
              {sampleNote && <p className="text-xs text-muted">{sampleNote}</p>}
              {latestSample && (
                <div className="rounded-lg border border-border/60 p-2 text-xs">
                  <p>
                    Status:{" "}
                    <span className="font-semibold">{latestSample.verification_status}</span>
                  </p>
                  {latestSample.ai_assessment && (
                    <p className="mt-1 text-muted">{latestSample.ai_assessment}</p>
                  )}
                </div>
              )}
              <button
                type="button"
                className="text-xs text-muted hover:underline"
                onClick={() => setSampleSkillId(null)}
              >
                Close
              </button>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="skill-select">Add Skill</Label>
            <SelectMenu
              id="skill-select"
              value={newSkill.skill_id}
              onChange={(v) => setNewSkill({ ...newSkill, skill_id: v })}
              placeholder="Select skill"
              options={skills.map((s) => ({
                value: String(s.id),
                label: s.name,
                icon: <Wrench className="h-4 w-4" aria-hidden />,
              }))}
            />
            <SelectMenu
              id="skill-level"
              value={newSkill.level}
              onChange={(v) => setNewSkill({ ...newSkill, level: v })}
              options={[
                { value: "beginner", label: "Beginner", icon: <Award className="h-4 w-4" aria-hidden /> },
                {
                  value: "intermediate",
                  label: "Intermediate",
                  icon: <Award className="h-4 w-4" aria-hidden />,
                },
                { value: "advanced", label: "Advanced", icon: <Award className="h-4 w-4" aria-hidden /> },
                { value: "expert", label: "Expert", icon: <Award className="h-4 w-4" aria-hidden /> },
              ]}
            />
            <Button variant="outline" onClick={() => void handleAddSkill()}>
              Add Skill
            </Button>
          </div>
        </Card>
      </DashboardPortalShell>
    </AuthenticatedRoute>
  );
}

export default function MemberProfilePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <MemberProfileContent />
    </Suspense>
  );
}
