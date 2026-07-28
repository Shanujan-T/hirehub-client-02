"use client";

import { useEffect, useState } from "react";
import { notify } from "@/lib/notify";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, memberNav } from "@/components/portal-shell";
import { Badge, Button, Card, Input, Label, SelectMenu, Textarea } from "@/components/ui";
import { Award, Wrench } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { getErrorMessage } from "@/lib/utils";
import { createUserSkill, getSkills, getUserSkills, updateUser } from "@/services/contract";

export default function MemberProfilePage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
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
    <AuthenticatedRoute allowedRoles={["user"]}>
      <PortalShell title="My Profile" subtitle="Account details, bio, and skills" navItems={memberNav}>
        <Card className="mx-auto max-w-lg space-y-6">
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
      </PortalShell>
    </AuthenticatedRoute>
  );
}
