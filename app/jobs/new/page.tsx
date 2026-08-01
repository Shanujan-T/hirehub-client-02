"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderOpen, Info, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { DashboardPortalShell } from "@/components/portal-shell";
import { Button, Card, Input, Label, SelectMenu, Textarea } from "@/components/ui";
import { createJobSchema, type CreateJobForm } from "@/lib/schemas";
import { getErrorMessage } from "@/lib/utils";
import {
  createJob,
  generateJobDescription,
  getCategories,
  getPricingSuggestion,
} from "@/services/job";
import type { Category } from "@/types/job";

export default function NewJobPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggested, setSuggested] = useState<number | null>(null);
  const [sampleSize, setSampleSize] = useState(0);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<CreateJobForm>({
    resolver: zodResolver(createJobSchema),
  });
  const categoryId = watch("category_id");
  const location = watch("location");

  useEffect(() => { getCategories().then(setCategories).catch(() => toast.error("Failed to load categories")); }, []);

  useEffect(() => {
    if (categoryId && location) {
      getPricingSuggestion(Number(categoryId), location)
        .then((p) => {
          setSuggested(p.average_price);
          setSampleSize(p.sample_size);
          if (p.average_price != null) setValue("final_price", p.average_price);
        })
        .catch(() => {});
    }
  }, [categoryId, location, setValue]);

  const handleGenerate = async () => {
    if (!aiPrompt.trim() || aiLoading) return;
    setAiLoading(true);
    setAiUnavailable(false);
    try {
      const suggestion = await generateJobDescription(aiPrompt.trim());
      if (!suggestion) {
        setAiUnavailable(true);
        return;
      }
      setValue("title", suggestion.title, { shouldValidate: true });
      setValue("description", suggestion.description, { shouldValidate: true });
      if (suggestion.category_id) {
        setValue("category_id", suggestion.category_id, { shouldValidate: true });
      }
      toast.success("AI draft applied — review and edit before posting");
    } catch (err) {
      setAiUnavailable(true);
      toast.error(getErrorMessage(err, "AI suggestion unavailable"));
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmit = async (data: CreateJobForm) => {
    try {
      await createJob(data);
      toast.success("Job posted");
      router.push("/jobs");
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to post job"));
    }
  };

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell title="Post a Job" subtitle="Communities apply as teams — not individuals">
        <Card className="mx-auto max-w-lg">
          <div className="mb-6 space-y-3 rounded-xl border border-border/70 bg-background/40 p-4">
            <Label htmlFor="ai-rough" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" aria-hidden />
              Draft with AI (optional)
            </Label>
            <Textarea
              id="ai-rough"
              rows={3}
              placeholder='e.g. "need someone to fix my kitchen sink"'
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={aiLoading || !aiPrompt.trim()}
              onClick={handleGenerate}
            >
              {aiLoading ? "Generating…" : "Generate with AI"}
            </Button>
            {aiUnavailable && (
              <p className="text-xs text-muted">AI suggestion unavailable — fill the form manually.</p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-category">Category</Label>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <SelectMenu
                    id="job-category"
                    value={field.value ? String(field.value) : ""}
                    onChange={(v) => field.onChange(v ? Number(v) : undefined)}
                    onBlur={field.onBlur}
                    placeholder="Select category"
                    options={categories.map((c) => ({
                      value: String(c.id),
                      label: c.name,
                      icon: <FolderOpen className="h-4 w-4" aria-hidden />,
                    }))}
                  />
                )}
              />
              {errors.category_id && <p className="text-xs text-destructive">{errors.category_id.message}</p>}
            </div>
            <div className="space-y-2"><Label>Title</Label><Input {...register("title")} />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
            <div className="space-y-2"><Label>Description</Label><Textarea {...register("description")} />{errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}</div>
            <div className="space-y-2"><Label>Location</Label><Input {...register("location")} />{errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}</div>
            <div className="space-y-2"><Label>Deadline</Label><Input type="date" {...register("deadline")} /></div>
            <div className="rounded-xl border border-info/30 bg-info/10 p-4">
              <Label className="flex items-center gap-2 text-info"><Info className="h-4 w-4" />Suggested Price (category_pricing)</Label>
              {suggested != null ? (
                <p className="mt-1 text-2xl font-extrabold text-info">${suggested.toFixed(2)} <span className="text-sm font-normal">({sampleSize} samples)</span></p>
              ) : (
                <p className="mt-1 text-sm text-muted">No pricing data for this category + location yet.</p>
              )}
            </div>
            <div className="space-y-2"><Label>Final Price</Label><Input type="number" step="0.01" {...register("final_price")} /></div>
            <Button type="submit" variant="gradient" disabled={isSubmitting} className="w-full rounded-full">{isSubmitting ? "Posting..." : "Post Job"}</Button>
          </form>
        </Card>
      </DashboardPortalShell>
    </AuthenticatedRoute>
  );
}
