"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { ImageUploadControl } from "@/components/image-upload-control";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { UserAvatar } from "@/components/user-avatar";
import { Badge, Button, Card, Input, Label, SelectMenu, Textarea } from "@/components/ui";
import { Award, Wrench } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { getErrorMessage } from "@/lib/utils";
import { createUserSkill, getSkills, getUserSkills, updateUser } from "@/services/contract";
import { uploadUserAvatar } from "@/services/user";

export default function MemberProfilePage() {
  const { user, refreshUser, updateUser: setAuthUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [skills, setSkills] = useState<{ id: number; name: string }[]>([]);
  const [userSkills, setUserSkills] = useState<{ id: number; skill?: { name: string }; level: string }[]>([]);
  const [newSkill, setNewSkill] = useState({ skill_id: "", level: "intermediate" });

  useEffect(() => {
    getSkills().then(setSkills).catch(() => notify.error("Failed to load skills"));
    if (user) {
      setFullName(user.full_name || "");
      setLocation(user.location || "");
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
      await createUserSkill({ user_id: user.id, skill_id: Number(newSkill.skill_id), level: newSkill.level });
      getUserSkills(user.id).then(setUserSkills);
      notify.success("Skill added");
    } catch (err) {
      notify.error(getErrorMessage(err));
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
            fallback={<UserAvatar name={user?.full_name ?? "Member"} avatarUrl={user?.avatar_url} size="lg" className="h-24 w-24 text-lg" />}
          />

          <div className="rounded-lg border border-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">Identity verification</p>
                <p className="text-sm text-muted">Required before creating a community</p>
              </div>
              <StatusBadge status={user?.identity_status ?? "unverified"} kind="identity" />
            </div>
            {user?.identity_status !== "verified" && (
              <Link href="/member/profile/identity-verification" className="mt-3 inline-block text-sm text-info hover:underline">
                {user?.identity_status === "pending" ? "View verification status" : "Verify your identity"}
              </Link>
            )}
          </div>

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
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, region (optional)"
                autoComplete="address-level2"
              />
            </div>
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

          <div>
            <Label>Skills</Label>
            <ul className="mt-2 space-y-1 text-sm">
              {userSkills.map((s) => (
                <li key={s.id}>
                  <Badge variant="info">
                    {s.skill?.name} — {s.level}
                  </Badge>
                </li>
              ))}
            </ul>
          </div>

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
                { value: "intermediate", label: "Intermediate", icon: <Award className="h-4 w-4" aria-hidden /> },
                { value: "advanced", label: "Advanced", icon: <Award className="h-4 w-4" aria-hidden /> },
                { value: "expert", label: "Expert", icon: <Award className="h-4 w-4" aria-hidden /> },
              ]}
            />
            <Button variant="outline" onClick={handleAddSkill}>
              Add Skill
            </Button>
          </div>
        </Card>
      </DashboardPortalShell>
    </AuthenticatedRoute>
  );
}
