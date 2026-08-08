"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { notify } from "@/lib/notify";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { ImageUploadControl } from "@/components/image-upload-control";
import { LoadingState } from "@/components/page-states";
import { DashboardPortalShell } from "@/components/portal-shell";
import { UserAvatar } from "@/components/user-avatar";
import { Badge, Button, Card, Input, Label, Textarea, SelectMenu } from "@/components/ui";
import { Wrench, Award } from "lucide-react";
import { useScrollToProfileHash } from "@/lib/profile-account-scroll";
import { MY_COMMUNITIES_RETURN, safeReturnPath } from "@/lib/return-navigation";
import { useAuth } from "@/providers/auth-provider";
import { getErrorMessage } from "@/lib/utils";
import {
  createWorkSample,
  getSkills,
  getUserSkillWithSamples,
  uploadWorkSampleImage,
  updateUser,
} from "@/services/contract";
import {
  uploadUserAvatar,
  getMySkills,
  addMySkill,
  updateMySkill,
  deleteMySkill,
} from "@/services/user";
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
  useScrollToProfileHash();
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [address, setAddress] = useState<UserAddress>({});
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [skills, setSkills] = useState<{ id: number; name: string }[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [sampleSkillId, setSampleSkillId] = useState<number | null>(null);
  const [sampleText, setSampleText] = useState("");
  const [sampleBusy, setSampleBusy] = useState(false);
  const [sampleNote, setSampleNote] = useState<string | null>(null);
  const [latestSample, setLatestSample] = useState<WorkSample | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("intermediate");

  const [requestSkillName, setRequestSkillName] = useState("");
  const [requestingSkill, setRequestingSkill] = useState(false);
  const [showRequestSkill, setShowRequestSkill] = useState(false);

  useEffect(() => {
    if (user?.identity_status === "verified" && searchParams.get("returnTo")) {
      router.replace(returnTo);
    }
  }, [user?.identity_status, returnTo, router, searchParams]);

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  useEffect(() => {
    getSkills().then(setSkills).catch(() => notify.error("Failed to load skills"));
    if (user) {
      setFullName(user.full_name || "");
      setLocation(user.location || "");
      setAddress(userAddressFromUser(user));
      setBio(user.bio || "");
      getMySkills().then(setUserSkills).catch(() => { });
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

  const handleAddSkillClick = async () => {
    if (!selectedSkillId) {
      notify.error("Please select a skill first");
      return;
    }
    try {
      await addMySkill({
        skill_id: Number(selectedSkillId),
        level: selectedLevel,
      });
      const updated = await getMySkills();
      setUserSkills(updated);
      notify.success("Skill added");
      setSelectedSkillId("");
      setSelectedLevel("intermediate");
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to add skill"));
    }
  };


  const handleUpdateSkillLevel = async (userSkillId: number, level: string) => {
    try {
      await updateMySkill(userSkillId, level);
      const updated = await getMySkills();
      setUserSkills(updated);
      notify.success("Skill level updated");
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to update skill level"));
    }
  };

  const handleRemoveSkill = async (userSkillId: number, skillName: string) => {
    if (!window.confirm(`Remove "${skillName}" from your skills?`)) return;
    try {
      await deleteMySkill(userSkillId);
      const updated = await getMySkills();
      setUserSkills(updated);
      notify.success("Skill removed");
      if (sampleSkillId === userSkillId) {
        setSampleSkillId(null);
      }
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to remove skill"));
    }
  };

  const handleRequestSkill = async () => {
    if (!requestSkillName.trim()) return;
    setRequestingSkill(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    notify.success("Your skill request is pending admin review.");
    setShowRequestSkill(false);
    setRequestSkillName("");
    setRequestingSkill(false);
  };

  const refreshSkill = async (userSkillId: number) => {
    try {
      const updated = await getUserSkillWithSamples(userSkillId);
      setUserSkills((prev) => prev.map((s) => (s.id === userSkillId ? { ...s, ...updated } : s)));
      return updated;
    } catch {
      if (user) getMySkills().then(setUserSkills);
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

  const skillOptions = skills
    .filter((s) => !userSkills.some((us) => us.skill_id === s.id))
    .map((s) => ({
      value: String(s.id),
      label: s.name,
    }));

  const levelOptions = [
    { value: "beginner", label: "Beginner", icon: <Award className="h-4 w-4" /> },
    { value: "intermediate", label: "Intermediate", icon: <Award className="h-4 w-4" /> },
    { value: "advanced", label: "Advanced", icon: <Award className="h-4 w-4" /> },
    { value: "expert", label: "Expert", icon: <Award className="h-4 w-4" /> },
  ];

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell title="My Profile" subtitle="Account details, bio, and skills">
        <div id="profile" className="scroll-mt-24">
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

          <div id="skills" className="scroll-mt-24 space-y-4 rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Skills</p>
              <p className="mt-1 text-xs text-muted">
                Add skills relevant to your work. These help communities and employers find the right fit.
              </p>
            </div>

            {/* List of current skills */}
            {userSkills.length > 0 && (
              <div className="flex flex-col gap-2">
                {userSkills.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/50 p-3 text-sm"
                  >
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground truncate">
                          {s.skill?.name ?? "Skill"}
                        </span>
                        {s.ai_reviewed && (
                          <Badge variant="completed" className="text-[10px] normal-case">
                            AI-reviewed
                          </Badge>
                        )}
                      </div>
                      <button
                        type="button"
                        className="text-left text-xs font-medium text-info hover:underline"
                        onClick={() => {
                          setSampleSkillId(s.id);
                          setSampleNote(null);
                          setLatestSample(null);
                        }}
                      >
                        Add work sample
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={s.level}
                        onChange={(e) => void handleUpdateSkillLevel(s.id, e.target.value)}
                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-info cursor-pointer"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                      <button
                        type="button"
                        className="text-xs font-semibold text-muted hover:text-destructive hover:scale-110 px-1 transition"
                        onClick={() => void handleRemoveSkill(s.id, s.skill?.name ?? "Skill")}
                        aria-label="Remove skill"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add Skill section */}
            <div className="space-y-3 pt-2">
              <p className="text-sm font-semibold text-foreground">Add Skill</p>

              <SelectMenu
                options={skillOptions}
                value={selectedSkillId}
                onChange={setSelectedSkillId}
                placeholder="Select skill"
              />

              <SelectMenu
                options={levelOptions}
                value={selectedLevel}
                onChange={setSelectedLevel}
                placeholder="Select level"
              />

              <button
                type="button"
                onClick={handleAddSkillClick}
                className="inline-flex h-9 items-center justify-center rounded-xl border-[1.5px] border-secondary bg-transparent px-4 text-xs font-bold text-secondary shadow-sm hover:bg-secondary/5 transition active:scale-95 cursor-pointer"
              >
                Add Skill
              </button>
            </div>

            {/* Request skill link */}
            <div className="pt-1">
              {!showRequestSkill ? (
                <button
                  type="button"
                  className="text-left text-xs font-medium text-info hover:underline"
                  onClick={() => setShowRequestSkill(true)}
                >
                  Don&apos;t see your skill? Request a new one
                </button>
              ) : (
                <div className="space-y-2 rounded-xl border border-border/70 bg-background/40 p-3">
                  <p className="text-sm font-semibold">Request a skill</p>
                  <div className="space-y-1">
                    <Label htmlFor="request-skill-name">Skill name</Label>
                    <Input
                      id="request-skill-name"
                      value={requestSkillName}
                      onChange={(e) => setRequestSkillName(e.target.value)}
                      placeholder="e.g. Next.js"
                      disabled={requestingSkill}
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      disabled={requestingSkill || !requestSkillName.trim()}
                      onClick={() => void handleRequestSkill()}
                    >
                      {requestingSkill ? "Submitting…" : "Submit request"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={requestingSkill}
                      onClick={() => {
                        setShowRequestSkill(false);
                        setRequestSkillName("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Work Sample form remains, positioned below the Skills section */}
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

          <ProfileAccountVerificationSection returnTo={returnTo} />
        </Card>
        </div>
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
