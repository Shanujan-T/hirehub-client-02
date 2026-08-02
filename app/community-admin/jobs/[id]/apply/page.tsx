"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { DashboardPortalShell } from "@/components/portal-shell";
import { LoadingState } from "@/components/page-states";
import { Button, Card, Input, Label, Textarea } from "@/components/ui";
import { jobBidSchema, type JobBidForm } from "@/lib/schemas";
import { buildFilteredPath } from "@/lib/navigation";
import { getErrorMessage } from "@/lib/utils";
import { applyToJob, getJob, suggestBid } from "@/services/job";
import type { Job } from "@/types/job";

function ApplyToJobContent() {
  const params = useParams();
  const router = useRouter();
  const jobId = Number(params.id);
  const { communityId } = useCommunityAdmin();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReasoning, setAiReasoning] = useState<string | null>(null);
  const [aiUnavailable, setAiUnavailable] = useState(false);

  const jobDetailHref = `/community-admin/jobs/${jobId}`;
  const jobsListHref = buildFilteredPath("/community-admin/jobs", {});

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JobBidForm>({
    resolver: zodResolver(jobBidSchema),
  });

  useEffect(() => {
    getJob(jobId)
      .then(setJob)
      .catch(() => toast.error("Failed to load job"))
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleSuggest = async () => {
    if (!communityId || aiLoading) return;
    setAiLoading(true);
    setAiUnavailable(false);
    try {
      const suggestion = await suggestBid(jobId, communityId);
      if (!suggestion) {
        setAiUnavailable(true);
        setAiReasoning(null);
        return;
      }
      setValue("proposed_cost", suggestion.suggested_cost, { shouldValidate: true });
      setValue("proposed_days", suggestion.suggested_days, { shouldValidate: true });
      setAiReasoning(suggestion.reasoning);
      toast.success("AI suggestion applied — adjust before submitting");
    } catch (err) {
      setAiUnavailable(true);
      toast.error(getErrorMessage(err, "AI suggestion unavailable"));
    } finally {
      setAiLoading(false);
    }
  };

  const onSubmit = async (data: JobBidForm) => {
    if (!communityId) return;
    try {
      await applyToJob({
        job_id: jobId,
        community_id: communityId,
        proposed_cost: data.proposed_cost,
        proposed_days: data.proposed_days,
        note: data.note?.trim() || undefined,
      });
      toast.success("Bid submitted for your community");
      router.push(jobsListHref);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to submit bid"));
    }
  };

  return (
    <DashboardPortalShell
      title="Submit Bid"
      subtitle={job?.title ?? "Community job application"}
      backHref={jobDetailHref}
      backLabel="Back to job"
    >
      {loading || !job ? (
        <LoadingState />
      ) : (
        <Card className="mx-auto max-w-lg space-y-5">
          <div>
            <h2 className="text-lg font-bold">{job.title}</h2>
            <p className="text-sm text-muted">{job.location}</p>
            <p className="mt-2 text-sm text-muted">
              Client asking price: <span className="font-semibold text-foreground">${job.final_price}</span>
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/40 p-3">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={aiLoading || !communityId}
              onClick={handleSuggest}
            >
              <Sparkles className="mr-2 h-4 w-4" aria-hidden />
              {aiLoading ? "Suggesting…" : "Suggest with AI"}
            </Button>
            {aiReasoning && (
              <p className="mt-2 text-sm text-muted">{aiReasoning}</p>
            )}
            {aiUnavailable && (
              <p className="mt-2 text-xs text-muted">AI suggestion unavailable — enter your bid manually.</p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="proposed_cost">Your proposed cost ($)</Label>
              <Input
                id="proposed_cost"
                type="number"
                step="0.01"
                min="0.01"
                placeholder={`Reference: ${job.final_price}`}
                {...register("proposed_cost")}
              />
              {errors.proposed_cost && (
                <p className="text-xs text-destructive">{errors.proposed_cost.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposed_days">Proposed timeline (days)</Label>
              <Input
                id="proposed_days"
                type="number"
                min="1"
                step="1"
                placeholder="e.g. 14"
                {...register("proposed_days")}
              />
              {errors.proposed_days && (
                <p className="text-xs text-destructive">{errors.proposed_days.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                rows={4}
                placeholder="Explain your approach, team strengths, or delivery plan."
                {...register("note")}
              />
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button type="submit" variant="gradient" className="rounded-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit Bid"}
              </Button>
              <Link href={jobDetailHref}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </Card>
      )}
    </DashboardPortalShell>
  );
}

export default function ApplyToJobPage() {
  return (
    <CommunityAdminRoute>
      <Suspense fallback={<LoadingState />}>
        <ApplyToJobContent />
      </Suspense>
    </CommunityAdminRoute>
  );
}
