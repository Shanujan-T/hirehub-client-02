"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { DashboardPortalShell } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { LoadingState } from "@/components/page-states";
import { Button, Card, Input, Label } from "@/components/ui";
import { deliverableSchema } from "@/lib/schemas";
import { useAsyncItem } from "@/lib/hooks/use-async";
import { getErrorMessage } from "@/lib/utils";
import { getContract, submitDeliverable } from "@/services/contract";
import { z } from "zod";

type MemberTaskView = {
  title: string;
  description: string;
  location: string;
  deadline: string;
};

function toMemberTaskView(contract: Awaited<ReturnType<typeof getContract>>): MemberTaskView | null {
  if (!contract.job) return null;
  return {
    title: contract.job.title,
    description: contract.job.description,
    location: contract.job.location,
    deadline: contract.job.deadline,
  };
}

export default function MemberContractDetailPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <MemberContractDetailContent />
    </Suspense>
  );
}

function MemberContractDetailContent() {
  const params = useParams();
  const contractId = Number(params.id);
  const { data: contract, loading, reload } = useAsyncItem(useCallback(() => getContract(contractId), [contractId]));
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<z.infer<typeof deliverableSchema>>({
    resolver: zodResolver(deliverableSchema),
  });

  const task = contract ? toMemberTaskView(contract) : null;

  const onSubmit = async (data: z.infer<typeof deliverableSchema>) => {
    try {
      await submitDeliverable(contractId, data.deliverable_url);
      toast.success("Deliverable submitted to admin");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell
        title="Contract Task"
        subtitle="Scope only — client identity never shown"
       
        backHref="/employer/my-contracts"
        backLabel="Back to contracts"
      >
        {loading || !contract || !task ? <LoadingState /> : (
          <Card className="max-w-lg space-y-4">
            <div className="flex justify-between gap-3">
              <h2 className="text-xl font-extrabold">{task.title}</h2>
              <StatusBadge status={contract.status} kind="contract" />
            </div>
            <p className="text-sm text-muted">{task.description}</p>
            <p className="text-sm text-muted">Location: {task.location} · Due: {task.deadline}</p>
            {contract.status === "active" && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="space-y-2"><Label>Deliverable URL</Label><Input {...register("deliverable_url")} placeholder="https://..." /></div>
                <Button type="submit" variant="gradient" disabled={isSubmitting} className="rounded-full">Submit to Admin</Button>
              </form>
            )}
          </Card>
        )}
      </DashboardPortalShell>
    </AuthenticatedRoute>
  );
}
