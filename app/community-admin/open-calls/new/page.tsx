"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { DashboardPortalShell } from "@/components/portal-shell";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { openCallSchema, type OpenCallForm } from "@/lib/schemas";
import { getErrorMessage } from "@/lib/utils";
import {
  createOpenCall,
  generateOpenCallDescription,
  getSkills,
} from "@/services/community";

export default function NewOpenCallPage() {
  const router = useRouter();
  const { communityId } = useCommunityAdmin();
  const [skills, setSkills] = useState<{ id: number; name: string }[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<number[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<OpenCallForm>({
    resolver: zodResolver(openCallSchema),
  });

  const titleValue = watch("title") || "";

  useEffect(() => {
    getSkills().then(setSkills).catch(() => toast.error("Failed to load skills"));
  }, []);

  useEffect(() => {
    if (communityId) setValue("community_id", communityId);
  }, [communityId, setValue]);

  const toggleSkill = (id: number) => {
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleGenerateDescription = async () => {
    if (aiLoading) return;
    const skillNames = skills
      .filter((s) => selectedSkills.includes(s.id))
      .map((s) => s.name);
    if (!titleValue.trim() && skillNames.length === 0) {
      toast.error("Add a title or skills before generating");
      return;
    }
    setAiLoading(true);
    setAiUnavailable(false);
    try {
      const suggestion = await generateOpenCallDescription({
        title: titleValue.trim(),
        required_skills: skillNames,
      });
      if (!suggestion?.description) {
        setAiUnavailable(true);
        return;
      }
      setValue("description", suggestion.description, { shouldDirty: true });
    } catch {
      setAiUnavailable(true);
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmit = async (data: OpenCallForm) => {
    if (!communityId) return;
    try {
      await createOpenCall({
        ...data,
        community_id: communityId,
        description: data.description?.trim() || undefined,
        skill_ids: selectedSkills,
      });
      toast.success("Open call created");
      router.push("/community-admin/open-calls");
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <CommunityAdminRoute>
      <DashboardPortalShell
        title="New Open Call"
        backHref="/community-admin/open-calls"
        backLabel="Back to open calls"
      >
        <Card className="max-w-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input type="hidden" {...register("community_id")} />
            <div className="space-y-2">
              <Label>Title</Label>
              <Input {...register("title")} />
            </div>
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
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="open-call-description">Description</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  disabled={aiLoading}
                  onClick={() => void handleGenerateDescription()}
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                  {aiLoading ? "Generating…" : "Generate with AI"}
                </Button>
              </div>
              <Textarea
                id="open-call-description"
                rows={5}
                placeholder="Optional recruiting copy — or generate a draft with AI"
                {...register("description")}
              />
              {aiUnavailable && (
                <p className="text-xs text-muted">
                  AI suggestion unavailable — write your own description.
                </p>
              )}
            </div>
            <Button
              type="submit"
              variant="gradient"
              disabled={isSubmitting}
              className="rounded-full"
            >
              Create Open Call
            </Button>
          </form>
        </Card>
      </DashboardPortalShell>
    </CommunityAdminRoute>
  );
}
