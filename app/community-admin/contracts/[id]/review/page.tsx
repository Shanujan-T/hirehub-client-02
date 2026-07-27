"use client";

import { useParams } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { CommunityAdminRoute } from "@/components/community-admin-route";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncItem } from "@/lib/hooks/use-async";
import { getErrorMessage } from "@/lib/utils";
import { adminApproveDeliverable, getContract } from "@/services/contract";

export default function AdminReviewDeliverablePage() {
  const params = useParams();
  const contractId = Number(params.id);
  const { data: contract, loading, reload } = useAsyncItem(useCallback(() => getContract(contractId), [contractId]));

  const handleApprove = async () => {
    try {
      await adminApproveDeliverable(contractId);
      toast.success("Deliverable forwarded to employer");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <CommunityAdminRoute>
      <PortalShell title="Review Deliverable" subtitle="QA before employer sees it" navItems={communityAdminNav}>
        {loading || !contract ? <LoadingState /> : (
          <Card className="max-w-xl space-y-4">
            <h2 className="font-extrabold">{contract.job?.title}</h2>
            {contract.deliverable_url ? (
              <a href={contract.deliverable_url} target="_blank" rel="noreferrer" className="text-info underline">{contract.deliverable_url}</a>
            ) : (
              <p className="text-muted">No deliverable submitted yet.</p>
            )}
            {contract.status === "submitted" && (
              <Button variant="gradient" className="rounded-full" onClick={handleApprove}>Approve & Forward to Employer</Button>
            )}
          </Card>
        )}
      </PortalShell>
    </CommunityAdminRoute>
  );
}
