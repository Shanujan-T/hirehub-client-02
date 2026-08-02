"use client";

import { Suspense, useCallback, useState } from "react";
import { useParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { CommunityAdminRoute } from "@/components/community-admin-route";
import { DashboardPortalShell } from "@/components/portal-shell";
import { LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncItem } from "@/lib/hooks/use-async";
import { getErrorMessage } from "@/lib/utils";
import { adminApproveDeliverable, aiReviewDeliverable, getContract } from "@/services/contract";

function ReviewDeliverableContent() {
  const params = useParams();
  const contractId = Number(params.id);
  const { data: contract, loading, reload } = useAsyncItem(
    useCallback(() => getContract(contractId), [contractId])
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);

  const handleAiPreCheck = async () => {
    if (aiLoading) return;
    setAiLoading(true);
    setAiUnavailable(false);
    try {
      const review = await aiReviewDeliverable(contractId);
      if (!review) {
        setAiUnavailable(true);
        setAiReview(null);
      } else {
        setAiReview(review);
      }
      setAiLoaded(true);
    } catch (err) {
      setAiUnavailable(true);
      toast.error(getErrorMessage(err, "AI suggestion unavailable"));
      setAiLoaded(true);
    } finally {
      setAiLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      await adminApproveDeliverable(contractId);
      toast.success("Deliverable forwarded to client");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <CommunityAdminRoute>
      <DashboardPortalShell
        title="Review Deliverable"
        subtitle="QA before client sees it"
        backHref={`/community-admin/contracts/${contractId}`}
        backLabel="Back to contract"
      >
        {loading || !contract ? (
          <LoadingState />
        ) : (
          <div className="mx-auto max-w-xl space-y-4">
            <Card className="space-y-4">
              <h2 className="font-extrabold">{contract.job?.title}</h2>
              {contract.job?.description && (
                <p className="text-sm text-muted">{contract.job.description}</p>
              )}
              {contract.deliverable_url ? (
                <a
                  href={contract.deliverable_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-info underline"
                >
                  {contract.deliverable_url}
                </a>
              ) : (
                <p className="text-muted">No deliverable submitted yet.</p>
              )}
            </Card>

            {contract.deliverable_url && (
              <Card className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="flex items-center gap-2 font-bold">
                    <Sparkles className="h-4 w-4" aria-hidden />
                    AI Pre-Check
                  </h3>
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    disabled={aiLoading}
                    onClick={handleAiPreCheck}
                  >
                    {aiLoading ? "Checking…" : aiLoaded ? "Refresh AI Pre-Check" : "Run AI Pre-Check"}
                  </Button>
                </div>
                <p className="text-xs text-muted">
                  Assistive suggestion only — your approve/reject decision is final.
                </p>
                {aiReview && (
                  <p className="whitespace-pre-wrap rounded-xl border border-border/70 bg-background/40 p-3 text-sm">
                    {aiReview}
                  </p>
                )}
                {aiUnavailable && (
                  <p className="text-xs text-muted">AI suggestion unavailable.</p>
                )}
              </Card>
            )}

            {contract.status === "submitted" && (
              <Card>
                <Button variant="gradient" className="rounded-full" onClick={handleApprove}>
                  Approve & Forward to Client
                </Button>
              </Card>
            )}
          </div>
        )}
      </DashboardPortalShell>
    </CommunityAdminRoute>
  );
}

export default function AdminReviewDeliverablePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ReviewDeliverableContent />
    </Suspense>
  );
}
