"use client";

import Link from "next/link";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Building2, CalendarDays, Wrench } from "lucide-react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Badge, Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { useListNavigation } from "@/lib/hooks/use-list-navigation";
import { cn, getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  applyToContract,
  getContracts,
  getMyContractApplications,
  getUserSkills,
} from "@/services/contract";
import type { Contract, ContractApplication } from "@/types/contract";
import type { UserSkill } from "@/types/skill";

type FilterTab = "all" | "pending" | "active" | "completed";

const FILTERS: { id: FilterTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Open / Pending" },
  { id: "active", label: "Active" },
  { id: "completed", label: "Completed" },
];

function formatDeadline(value?: string | null) {
  if (!value) return "No deadline set";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function memberFacingStatus(
  contract: Contract,
  userId: number | undefined
): { status: string; label?: string } {
  if (contract.assigned_member_id === userId) {
    if (contract.status === "active") {
      return { status: "active", label: "Assigned to you" };
    }
    if (contract.status === "submitted") {
      return { status: "submitted", label: "Deliverable submitted" };
    }
    if (contract.status === "completed") {
      return { status: "completed", label: "Completed" };
    }
  }
  return { status: contract.status };
}

function requiredSkills(contract: Contract): string[] {
  const skills: string[] = [];
  if (contract.job?.category?.name) skills.push(contract.job.category.name);
  if (contract.community?.specialization) {
    const parts = contract.community.specialization
      .split(/[,|/]/)
      .map((s) => s.trim())
      .filter(Boolean);
    for (const part of parts) {
      if (!skills.some((s) => s.toLowerCase() === part.toLowerCase())) {
        skills.push(part);
      }
    }
  }
  return skills.length ? skills : ["General"];
}

function hasSkillFit(contract: Contract, userSkills: UserSkill[]): boolean {
  if (userSkills.length === 0) return true; // unknown profile — don't block
  const category = contract.job?.category?.name?.trim().toLowerCase();
  if (!category) return true;
  return userSkills.some((us) => {
    const skillCategory = us.skill?.category?.trim().toLowerCase();
    const skillName = us.skill?.name?.trim().toLowerCase();
    return skillCategory === category || skillName?.includes(category) || category.includes(skillName || "");
  });
}

function hasAvailabilityConflict(
  candidate: Contract,
  all: Contract[],
  userId: number | undefined
): Contract | null {
  if (!userId || !candidate.job?.deadline) return null;
  const candidateDeadline = new Date(candidate.job.deadline).getTime();
  if (Number.isNaN(candidateDeadline)) return null;

  for (const other of all) {
    if (other.id === candidate.id) continue;
    if (other.assigned_member_id !== userId) continue;
    if (other.status !== "active" && other.status !== "submitted") continue;
    const otherDeadline = other.job?.deadline ? new Date(other.job.deadline).getTime() : NaN;
    if (Number.isNaN(otherDeadline)) {
      return other; // active work with unknown deadline still blocks confidence
    }
    // Conflict when another active job is due on/before this one (overlapping load)
    if (otherDeadline <= candidateDeadline || candidateDeadline <= otherDeadline) {
      return other;
    }
  }
  return null;
}

function matchesFilter(contract: Contract, filter: FilterTab, _userId: number | undefined) {
  if (filter === "all") return true;
  if (filter === "pending") {
    return contract.status === "open_internally" || contract.status === "pending_assignment";
  }
  if (filter === "active") {
    return contract.status === "active" || contract.status === "submitted";
  }
  return contract.status === "completed";
}

function isMemberRelevant(contract: Contract, userId: number | undefined) {
  if (!userId) return false;
  if (contract.assigned_member_id === userId) return true;
  // Internally open contracts members can request
  if (contract.status === "open_internally") return true;
  // Waiting room: only show if they somehow see it — keep out of primary member board
  return false;
}

function MemberContractCard({
  contract,
  userId,
  userSkills,
  applications,
  allContracts,
  applyingId,
  onRequest,
  detailHref,
}: {
  contract: Contract;
  userId: number | undefined;
  userSkills: UserSkill[];
  applications: ContractApplication[];
  allContracts: Contract[];
  applyingId: number | null;
  onRequest: (id: number) => void;
  detailHref: string;
}) {
  const isAssigned = contract.assigned_member_id === userId;
  const isOpen = contract.status === "open_internally";
  const alreadyRequested = applications.some(
    (a) => a.contract_id === contract.id && a.status === "applied"
  );
  const skillFit = hasSkillFit(contract, userSkills);
  const conflict = isOpen && !isAssigned ? hasAvailabilityConflict(contract, allContracts, userId) : null;
  const facing = memberFacingStatus(contract, userId);
  const skills = requiredSkills(contract);
  const description = contract.job?.description?.trim() || "";
  const shortDescription =
    description.length > 140 ? `${description.slice(0, 140).trim()}…` : description;

  return (
    <Card className="mb-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="text-lg font-extrabold text-foreground">
            {contract.job?.title ?? `Contract #${contract.id}`}
          </h3>
          {shortDescription && <p className="text-sm leading-relaxed text-muted">{shortDescription}</p>}

          <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {contract.community?.name ?? `Community #${contract.community_id}`}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden />
              Due {formatDeadline(contract.job?.deadline)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted">
              <Wrench className="h-3.5 w-3.5" aria-hidden />
              Skills
            </span>
            {skills.map((skill) => (
              <Badge key={skill} variant="info" className="normal-case">
                {skill}
              </Badge>
            ))}
            {isOpen && !skillFit && (
              <span className="text-xs text-amber-700 dark:text-amber-300">
                Your profile skills don’t strongly match this category
              </span>
            )}
          </div>

          {conflict && (
            <p className="inline-flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              You already have active work
              {conflict.job?.title ? ` (“${conflict.job.title}”)` : ""} due{" "}
              {formatDeadline(conflict.job?.deadline)}. Requesting this may overload your schedule.
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          {facing.label ? (
            <Badge
              variant={
                facing.status === "active"
                  ? "active"
                  : facing.status === "completed"
                    ? "completed"
                    : facing.status === "submitted"
                      ? "info"
                      : "default"
              }
              className="normal-case"
            >
              {facing.label}
            </Badge>
          ) : (
            <StatusBadge status={facing.status} kind="contract" />
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-4">
        {isAssigned && (
          <Link href={detailHref}>
            <Button variant="gradient" size="sm" className="rounded-full">
              View Details
            </Button>
          </Link>
        )}

        {isOpen && !isAssigned && alreadyRequested && (
          <Button variant="outline" size="sm" className="rounded-full" disabled>
            Request submitted
          </Button>
        )}

        {isOpen && !isAssigned && !alreadyRequested && (
          <Button
            variant="gradient"
            size="sm"
            className="rounded-full"
            disabled={applyingId === contract.id}
            onClick={() => onRequest(contract.id)}
          >
            {applyingId === contract.id ? "Requesting…" : "Request This Contract"}
          </Button>
        )}

        {isOpen && !isAssigned && !alreadyRequested && !skillFit && (
          <p className="w-full text-xs text-muted">
            Skill fit looks weak for this category — you can still request; your admin makes the final assignment.
          </p>
        )}

        {contract.status === "pending_assignment" && !isAssigned && (
          <p className="text-xs text-muted">
            Waiting for your community admin to open this contract for member requests.
          </p>
        )}
      </div>
    </Card>
  );
}

function MemberContractsContent() {
  const { user } = useAuth();
  const { hrefWithReturn, getFilter, setFilter } = useListNavigation();
  const filter = (getFilter("status") as FilterTab) || "all";
  const { data: contracts, loading, reload } = useAsyncList(useCallback(() => getContracts(), []));
  const [applications, setApplications] = useState<ContractApplication[]>([]);
  const [userSkills, setUserSkills] = useState<UserSkill[]>([]);
  const [applyingId, setApplyingId] = useState<number | null>(null);

  useEffect(() => {
    getMyContractApplications()
      .then(setApplications)
      .catch(() => setApplications([]));
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    getUserSkills(user.id)
      .then(setUserSkills)
      .catch(() => setUserSkills([]));
  }, [user?.id]);

  const memberContracts = useMemo(
    () => contracts.filter((c) => isMemberRelevant(c, user?.id)),
    [contracts, user?.id]
  );

  const filtered = useMemo(
    () => memberContracts.filter((c) => matchesFilter(c, filter, user?.id)),
    [memberContracts, filter, user?.id]
  );

  const handleRequest = async (contractId: number) => {
    setApplyingId(contractId);
    try {
      await applyToContract(contractId);
      toast.success("Request submitted — your community admin will choose who is assigned");
      const apps = await getMyContractApplications();
      setApplications(apps);
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to request contract"));
    } finally {
      setApplyingId(null);
    }
  };

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell
        title="My Contracts"
        subtitle="Request open internal work from your communities — client identity stays hidden"
      >
        <div className="mb-5 flex flex-wrap gap-2">
          {FILTERS.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={filter === tab.id ? "gradient" : "outline"}
              className={cn("rounded-full", filter === tab.id && "shadow-sm")}
              onClick={() => setFilter("status", tab.id === "all" ? null : tab.id)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {loading ? (
          <LoadingState label="Loading contracts…" />
        ) : memberContracts.length === 0 ? (
          <EmptyState
            title="No contracts yet"
            description="When your community admin opens a won job for internal hiring, it will show up here so you can request it."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title="No contracts in this filter"
            description="Try another status tab — open requests, active work, or completed contracts."
          />
        ) : (
          filtered.map((contract) => (
            <MemberContractCard
              key={contract.id}
              contract={contract}
              userId={user?.id}
              userSkills={userSkills}
              applications={applications}
              allContracts={memberContracts}
              applyingId={applyingId}
              onRequest={(id) => void handleRequest(id)}
              detailHref={hrefWithReturn(`/member/contracts/${contract.id}`)}
            />
          ))
        )}
      </DashboardPortalShell>
    </AuthenticatedRoute>
  );
}

export default function MemberContractsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <MemberContractsContent />
    </Suspense>
  );
}
