"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderOpen, Info } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, employerNav } from "@/components/portal-shell";
import { Button, Card, Input, Label, SelectMenu, Textarea } from "@/components/ui";
import { createJobSchema, type CreateJobForm } from "@/lib/schemas";
import { getErrorMessage } from "@/lib/utils";
import { createJob, getCategories, getPricingSuggestion } from "@/services/job";
import type { Category } from "@/types/job";

export default function NewJobPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggested, setSuggested] = useState<number | null>(null);
  const [sampleSize, setSampleSize] = useState(0);
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
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalShell title="Post a Job" subtitle="Communities apply as teams — not individuals" navItems={employerNav}>
        <Card className="mx-auto max-w-lg">
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
      </PortalShell>
    </AuthenticatedRoute>
  );
}
