"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { CommunityAdminRoute } from "@/components/community-admin-route";
import { MemberCard } from "@/components/member-card";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { LoadingState } from "@/components/page-states";
import { Button, Card, Input, Label } from "@/components/ui";
import { cn, getErrorMessage } from "@/lib/utils";
import {
  getContractApplicants,
  selectMembers,
  getContract,
} from "@/services/contract";
import { getCommunityMembers } from "@/services/community";
import { useAuth } from "@/providers/auth-provider";
import type { Contract, ContractApplication } from "@/types/contract";
import type { CommunityMember } from "@/types/community";
import { User, DollarSign, Info } from "lucide-react";

interface SelectionState {
  [userId: number]: {
    selected: boolean;
    payoutPercent: number;
  };
}

function SelectMemberContent() {
  const params = useParams();
  const router = useRouter();
  const contractId = Number(params.id);
  const { user } = useAuth();

  const [contract, setContract] = useState<Contract | null>(null);
  const [applications, setApplications] = useState<ContractApplication[]>([]);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selections, setSelections] = useState<SelectionState>({});
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const contractData = await getContract(contractId);
      setContract(contractData);

      const [appsData, membersData] = await Promise.all([
        getContractApplicants(contractId),
        getCommunityMembers(contractData.community_id, "approved"),
      ]);
      setApplications(appsData);
      setMembers(membersData);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to load page data."));
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  useEffect(() => {
    if (contractId) {
      void loadData();
    }
  }, [contractId, loadData]);

  // Derived budget info
  const commissionPct = contract ? Number(contract.commission_percent) : 3.0;
  const totalAmount = contract ? Number(contract.total_amount) : 0.0;
  const memberPayoutTotal = totalAmount * (1 - commissionPct / 100);

  // Sync / prevent duplicate selection logic
  const handleCheckboxChange = (userId: number, checked: boolean) => {
    setSelections((prev) => ({
      ...prev,
      [userId]: {
        selected: checked,
        payoutPercent: checked ? 100 : 0,
      },
    }));
  };

  const handlePercentChange = (userId: number, val: number) => {
    const cleanVal = isNaN(val) ? 0 : Math.min(100, Math.max(0, val));
    setSelections((prev) => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        selected: prev[userId]?.selected ?? true,
        payoutPercent: cleanVal,
      },
    }));
  };

  const handleAssignToMyself = () => {
    if (!user) {
      toast.error("You must be logged in to assign yourself.");
      return;
    }
    // Precheck current admin user at 100% allocation
    setSelections((prev) => ({
      ...prev,
      [user.id]: {
        selected: true,
        payoutPercent: 100,
      },
    }));
    toast.success("Pre-checked your row at 100% allocation.");
  };

  const handleFinalize = async () => {
    const selectedList = Object.entries(selections)
      .filter(([, sel]) => sel.selected)
      .map(([userIdStr, sel]) => {
        const uId = Number(userIdStr);
        const app = applications.find((a) => a.member_id === uId);
        return {
          application_id: app ? app.id : null,
          member_id: uId,
          payout_percent: sel.payoutPercent,
          payout_amount: Number(
            (memberPayoutTotal * (sel.payoutPercent / 100)).toFixed(2),
          ),
        };
      });

    if (selectedList.length === 0) {
      toast.error("Please select at least one member to assign.");
      return;
    }

    const totalPercent = selectedList.reduce(
      (sum, item) => sum + item.payout_percent,
      0,
    );
    if (totalPercent !== 100) {
      toast.error(
        `Total payout allocation must equal 100%. Current sum: ${totalPercent}%.`,
      );
      return;
    }

    setSubmitting(true);
    try {
      await selectMembers(contractId, selectedList);
      toast.success("Contract assignment finalized!");
      router.push(`/community-admin/contracts/${contractId}`);
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to finalize assignment."));
    } finally {
      setSubmitting(false);
    }
  };

  // Helper lists
  const applicantUserIds = new Set(applications.map((app) => app.member_id));

  // Sum up percentages of selected items
  const currentTotalPercent = Object.values(selections)
    .filter((sel) => sel.selected)
    .reduce((sum, sel) => sum + (sel.payoutPercent || 0), 0);

  if (loading) {
    return (
      <CommunityAdminRoute>
        <DashboardPortalShell
          title="Finalize Assignment"
          subtitle="Assign contract work to community members"
        >
          <LoadingState />
        </DashboardPortalShell>
      </CommunityAdminRoute>
    );
  }

  return (
    <CommunityAdminRoute>
      <DashboardPortalShell
        title="Finalize Assignment"
        subtitle="Manage applicants, assign directly, and distribute payout percentages."
        backHref={`/community-admin/contracts/${contractId}`}
        backLabel="Back to contract"
      >
        {/* Top Info Panel */}
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <Card className="bg-card/50 backdrop-blur-md">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Contract Budget
            </h3>
            <div className="mt-2 flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span>Total Amount:</span>
                <span className="font-bold text-foreground">
                  ${totalAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Commission ({commissionPct}%):</span>
                <span className="font-bold text-destructive">
                  -${(totalAmount * (commissionPct / 100)).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-border my-1" />
              <div className="flex justify-between text-base font-bold">
                <span className="text-info">Member Pool Payout:</span>
                <span className="text-success">
                  ${memberPayoutTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </Card>

          <Card className="flex flex-col justify-between bg-card/50 backdrop-blur-md">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
                Assignment Shortcuts
              </h3>
              <p className="text-xs text-muted mt-1">
                Pre-select yourself as the assignee to fast-track work delivery.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleAssignToMyself}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border-info/50 text-info hover:bg-info/10"
            >
              <User className="h-4 w-4" />
              Assign to myself
            </Button>
          </Card>
        </div>

        {/* Section 1: Internal Applicants */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              Internal Applicants
            </h2>
            <span className="rounded-full bg-accent/30 px-3 py-1 text-xs text-secondary-foreground font-semibold">
              {applications.length} applied
            </span>
          </div>

          {applications.length === 0 ? (
            <Card className="py-8 text-center text-muted">
              No applications submitted yet. Use the roster below to assign
              directly.
            </Card>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                if (!app.member) return null;
                const isSelected = !!selections[app.member_id]?.selected;
                const percent = selections[app.member_id]?.payoutPercent ?? 0;
                const amount = memberPayoutTotal * (percent / 100);

                return (
                  <Card
                    key={app.id}
                    className={cn(
                      "transition border-border/80 hover:border-info/30",
                      isSelected &&
                      "border-info ring-2 ring-info/5 bg-info/[0.01]",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <div className="mt-1 flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleCheckboxChange(
                              app.member_id,
                              e.target.checked,
                            )
                          }
                          className="h-5 w-5 rounded border-border text-info focus:ring-info/20 cursor-pointer"
                        />
                      </div>

                      {/* Member Info & Card */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                          <MemberCard user={app.member} />
                          <StatusBadge status={app.status} kind="application" />
                        </div>
                        {app.note && (
                          <div className="mt-3 rounded-xl bg-accent/20 p-3 text-sm text-muted-foreground italic border-l-2 border-accent">
                            &ldquo;{app.note}&rdquo;
                          </div>
                        )}

                        {/* Payout percent allocation if selected */}
                        {isSelected && (
                          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/40 pt-4">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground">
                                Payout share:
                              </Label>
                              <div className="relative flex items-center">
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={percent || ""}
                                  onChange={(e) =>
                                    handlePercentChange(
                                      app.member_id,
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-20 pr-6 text-right h-8 rounded-lg"
                                />
                                <span className="absolute right-2 text-xs font-semibold text-muted-foreground">
                                  %
                                </span>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-success flex items-center">
                              <DollarSign className="h-3.5 w-3.5" />
                              {amount.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Assign Directly */}
        <div className="mb-24">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">
              Assign Directly
            </h2>
            <span className="rounded-full bg-accent/30 px-3 py-1 text-xs text-secondary-foreground font-semibold">
              {members.length} members total
            </span>
          </div>

          {members.length === 0 ? (
            <Card className="py-8 text-center text-muted">
              No members in this community roster yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {members.map((m) => {
                if (!m.user) return null;
                const isSelected = !!selections[m.user_id]?.selected;
                const percent = selections[m.user_id]?.payoutPercent ?? 0;
                const amount = memberPayoutTotal * (percent / 100);

                return (
                  <Card
                    key={m.id}
                    className={cn(
                      "transition border-border/80 hover:border-info/30",
                      isSelected &&
                      "border-info ring-2 ring-info/5 bg-info/[0.01]",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Selection Checkbox */}
                      <div className="mt-1 flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) =>
                            handleCheckboxChange(m.user_id, e.target.checked)
                          }
                          className="h-5 w-5 rounded border-border text-info focus:ring-info/20 cursor-pointer"
                        />
                      </div>

                      {/* Member Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                          <MemberCard user={m.user} />
                          {/* Badge for role / admin */}
                          <div className="flex items-center gap-1.5">
                            {m.role === "admin" && (
                              <span className="inline-flex items-center rounded-full bg-secondary/15 px-2.5 py-0.5 text-xs font-semibold text-secondary">
                                Community Admin
                              </span>
                            )}
                            {applicantUserIds.has(m.user_id) && (
                              <span className="inline-flex items-center rounded-full bg-info/10 px-2.5 py-0.5 text-xs font-semibold text-info">
                                Applied
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Payout percent allocation if selected */}
                        {isSelected && (
                          <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/40 pt-4">
                            <div className="flex items-center gap-2">
                              <Label className="text-xs text-muted-foreground">
                                Payout share:
                              </Label>
                              <div className="relative flex items-center">
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={percent || ""}
                                  onChange={(e) =>
                                    handlePercentChange(
                                      m.user_id,
                                      Number(e.target.value),
                                    )
                                  }
                                  className="w-20 pr-6 text-right h-8 rounded-lg"
                                />
                                <span className="absolute right-2 text-xs font-semibold text-muted-foreground">
                                  %
                                </span>
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-success flex items-center">
                              <DollarSign className="h-3.5 w-3.5" />
                              {amount.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/80 p-4 shadow-lg backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground">
                <Info className="h-4 w-4 text-info" />
                <span>Allocation sum:</span>
                <span
                  className={cn(
                    "ml-1 font-bold",
                    currentTotalPercent === 100
                      ? "text-success"
                      : "text-destructive",
                  )}
                >
                  {currentTotalPercent}%
                </span>
                <span className="text-xs text-muted font-normal">
                  (must equal 100%)
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">
                {Object.values(selections).filter((s) => s.selected).length}{" "}
                member(s) selected for assignment.
              </p>
            </div>
            <Button
              variant="gradient"
              onClick={handleFinalize}
              disabled={submitting || currentTotalPercent !== 100}
              className="w-full rounded-full sm:w-auto px-8"
            >
              {submitting ? "Finalizing..." : "Finalize Assignment"}
            </Button>
          </div>
        </div>
      </DashboardPortalShell>
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
