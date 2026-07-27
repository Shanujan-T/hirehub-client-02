"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Button, Input, Label, Select, Textarea } from "@/components/ui";
import { useAuth } from "@/providers/auth-provider";
import { getSkills, getUserSkills, updateUser, createUserSkill } from "@/services/contract";

export default function MemberProfilePage() {
  const { user, refreshUser } = useAuth();
  const [skills, setSkills] = useState<{ id: number; name: string }[]>([]);
  const [userSkills, setUserSkills] = useState<{ id: number; skill?: { name: string }; level: string }[]>([]);
  const [bio, setBio] = useState("");
  const [newSkill, setNewSkill] = useState({ skill_id: "", level: "intermediate" });

  useEffect(() => {
    if (user) {
      setBio(user.bio || "");
      getUserSkills(user.id).then(setUserSkills);
    }
    getSkills().then(setSkills);
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    await updateUser(user.id, { bio });
    await refreshUser();
    toast.success("Profile updated");
  };

  const handleAddSkill = async () => {
    if (!user || !newSkill.skill_id) return;
    await createUserSkill({
      user_id: user.id,
      skill_id: Number(newSkill.skill_id),
      level: newSkill.level,
    });
    getUserSkills(user.id).then(setUserSkills);
    toast.success("Skill added");
  };

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <div className="mx-auto max-w-lg space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">My Profile</h1>
          <p className="text-muted">Skills, bio, and stats</p>
        </div>
        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
          <Button onClick={handleSave}>Save</Button>
        </div>
        <div className="space-y-2">
          <Label>Current Skills</Label>
          <ul className="text-sm">
            {userSkills.map((s) => (
              <li key={s.id}>{s.skill?.name} — {s.level}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-2">
          <Label>Add Skill</Label>
          <Select value={newSkill.skill_id} onChange={(e) => setNewSkill({ ...newSkill, skill_id: e.target.value })}>
            <option value="">Select skill</option>
            {skills.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          <Select value={newSkill.level} onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </Select>
          <Button onClick={handleAddSkill}>Add Skill</Button>
        </div>
      </div>
    </AuthenticatedRoute>
  );
}
