"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { Button, Card, Input, Label } from "@/components/ui";
import { openCallSchema, type OpenCallForm } from "@/lib/schemas";
import { getErrorMessage } from "@/lib/utils";
import { createOpenCall, getSkills } from "@/services/community";

export default function NewOpenCallPage() {
  const router = useRouter();
  const { communityId } = useCommunityAdmin();
  const [skills, setSkills] = useState<{ id: number; name: string }[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<OpenCallForm>({
    resolver: zodResolver(openCallSchema),
  });

  useEffect(() => {
    getSkills().then(setSkills).catch(() => toast.error("Failed to load skills"));
  }, []);

  useEffect(() => {
    if (communityId) setValue("community_id", communityId);
  }, [communityId, setValue]);

  const toggleSkill = (id: number) => {
    setSelectedSkills((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const onSubmit = async (data: OpenCallForm) => {
    if (!communityId) return;
    try {
      await createOpenCall({ ...data, community_id: communityId, skill_ids: selectedSkills });
      toast.success("Open call created");
      router.push("/community-admin/open-calls");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <CommunityAdminRoute>
      <PortalShell
        title="New Open Call"
        navItems={communityAdminNav}
        backHref="/community-admin/open-calls"
        backLabel="Back to open calls"
      >
        <Card className="max-w-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("community_id")} />
            <div className="space-y-2"><Label>Title</Label><Input {...register("title")} /></div>
            <div className="space-y-2">
              <Label>Required Skills</Label>
              <div className="flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Button
                    key={s.id}
                    type="button"
                    variant={selectedSkills.includes(s.id) ? "gradient" : "outline"}
                    size="sm"
                    className="rounded-full"
                    onClick={() => toggleSkill(s.id)}
                  >
                    {s.name}
                  </Button>
                ))}
              </div>
            </div>
            <Button type="submit" variant="gradient" disabled={isSubmitting} className="rounded-full">Create Open Call</Button>
          </form>
        </Card>
      </PortalShell>
    </CommunityAdminRoute>
  );
}
