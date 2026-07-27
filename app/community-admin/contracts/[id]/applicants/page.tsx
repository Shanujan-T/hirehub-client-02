"use client";

import { Suspense, useEffect, useState } from "react";
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
import { loadDraftSelection, saveDraftSelection } from "@/lib/navigation";
import { cn, getErrorMessage } from "@/lib/utils";
import { getContractApplicants, selectMember } from "@/services/contract";

function SelectMemberContent() {
  const params = useParams();
  const contractId = Number(params.id);
  const draftKey = `contract:${contractId}`;
  const [highlightedId, setHighlightedId] = useState<number | null>(null);
  const { data: applications, loading, reload } = useAsyncList(
    useCallback(() => getContractApplicants(contractId), [contractId])
  );

  useEffect(() => {
    const raw = loadDraftSelection(draftKey);
    if (raw) setHighlightedId(Number(raw));
  }, [draftKey]);

  const markDraft = (applicationId: number) => {
    setHighlightedId(applicationId);
    saveDraftSelection(draftKey, applicationId);
  };

  const handleSelect = async (applicationId: number) => {
    try {
      await selectMember(contractId, applicationId);
      saveDraftSelection(draftKey, null);
      toast.success("Member selected");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <CommunityAdminRoute>
      <PortalShell
        title="Select Member"
        subtitle="contract_application → one member"
        navItems={communityAdminNav}
        backHref={`/community-admin/contracts/${contractId}`}
        backLabel="Back to contract"
      >
        {loading ? <LoadingState /> : applications.length === 0 ? (
          <EmptyState title="No applicants" description="Members apply after contract is opened internally." />
        ) : (
          applications.map((app) => (
            <div
              key={app.id}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && markDraft(app.id)}
              onClick={() => markDraft(app.id)}
              className={cn(
                "mb-3 cursor-pointer rounded-2xl transition",
                highlightedId === app.id && "ring-2 ring-info/30"
              )}
            >
              <Card className={cn(highlightedId === app.id && "border-info")}>
                <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
                  {app.member && <MemberCard user={app.member} />}
                  <StatusBadge status={app.status} kind="application" />
                </div>
                {app.note && <p className="mt-2 text-sm text-muted">{app.note}</p>}
                {app.status === "applied" && (
                  <Button
                    variant="gradient"
                    className="mt-4 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelect(app.id);
                    }}
                  >
                    {highlightedId === app.id ? "Confirm Selection" : "Select Member"}
                  </Button>
                )}
              </Card>
            </div>
          ))
        )}
      </PortalShell>
    </CommunityAdminRoute>
  );
}

export default function SelectMemberPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SelectMemberContent />
    </Suspense>
  );
}
