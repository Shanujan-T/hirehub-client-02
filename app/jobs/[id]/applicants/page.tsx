"use client";

import { useParams } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { MemberCard } from "@/components/member-card";
import { PortalShell, employerNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getErrorMessage } from "@/lib/utils";
import { approveCommunity, getJobApplicants, rejectCommunity } from "@/services/job";

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = Number(params.id);
  const { data: applications, loading, reload } = useAsyncList(
    useCallback(() => getJobApplicants(jobId), [jobId])
  );

  const handleApprove = async (applicationId: number) => {
    try {
      await approveCommunity(applicationId, 3);
      toast.success("Community approved — contract created");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to approve"));
    }
  };

  const handleReject = async (applicationId: number) => {
    try {
      await rejectCommunity(applicationId);
      toast.success("Application rejected");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to reject"));
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalShell title="Applying Communities" subtitle="Review community members, approve one community" navItems={employerNav}>
        {loading ? <LoadingState /> : applications.length === 0 ? (
          <EmptyState title="No applications yet" description="Communities can apply to this open job." />
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => (
              <Card key={app.id}>
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-bold">{app.community?.name}</h3>
                  <StatusBadge status={app.status} kind="application" />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {app.community?.members?.map((m) => m.user && <MemberCard key={m.id} user={m.user} />)}
                </div>
                {app.status === "applied" && (
                  <div className="mt-4 flex gap-2">
                    <Button variant="gradient" className="rounded-full" onClick={() => handleApprove(app.id)}>Approve Community</Button>
                    <Button variant="destructive" onClick={() => handleReject(app.id)}>Reject</Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
