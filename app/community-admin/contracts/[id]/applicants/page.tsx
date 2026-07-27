"use client";

import { useParams } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { CommunityAdminRoute } from "@/components/community-admin-route";
import { MemberCard } from "@/components/member-card";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getErrorMessage } from "@/lib/utils";
import { getContractApplicants, selectMember } from "@/services/contract";

export default function SelectMemberPage() {
  const params = useParams();
  const contractId = Number(params.id);
  const { data: applications, loading, reload } = useAsyncList(
    useCallback(() => getContractApplicants(contractId), [contractId])
  );

  const handleSelect = async (applicationId: number) => {
    try {
      await selectMember(contractId, applicationId);
      toast.success("Member selected");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <CommunityAdminRoute>
      <PortalShell title="Select Member" subtitle="contract_application → one member" navItems={communityAdminNav}>
        {loading ? <LoadingState /> : applications.length === 0 ? (
          <EmptyState title="No applicants" description="Members apply after contract is opened internally." />
        ) : (
          applications.map((app) => (
            <Card key={app.id} className="mb-3">
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                {app.member && <MemberCard user={app.member} />}
                <StatusBadge status={app.status} kind="application" />
              </div>
              {app.note && <p className="mt-2 text-sm text-muted">{app.note}</p>}
              {app.status === "applied" && (
                <Button variant="gradient" className="mt-4 rounded-full" onClick={() => handleSelect(app.id)}>Select Member</Button>
              )}
            </Card>
          ))
        )}
      </PortalShell>
    </CommunityAdminRoute>
  );
}
