"use client";



import Link from "next/link";

import { Suspense, useCallback } from "react";

import { toast } from "sonner";

import { CommunityAdminRoute } from "@/components/community-admin-route";

import { DashboardPortalShell } from "@/components/portal-shell";

import { StatusBadge } from "@/components/status-badge";

import { EmptyState, LoadingState } from "@/components/page-states";

import { Button, Card } from "@/components/ui";

import { useAsyncList } from "@/lib/hooks/use-async";

import { useListNavigation } from "@/lib/hooks/use-list-navigation";

import { getErrorMessage } from "@/lib/utils";

import { getContracts, openContractInternally } from "@/services/contract";



function ContractsListContent() {

  const { hrefWithReturn } = useListNavigation();

  const { data: contracts, loading, reload } = useAsyncList(useCallback(() => getContracts(), []));



  const handleOpen = async (id: number) => {

    try {

      await openContractInternally(id);

      toast.success("Contract opened internally");

      reload();

    } catch (err) {

      toast.error(getErrorMessage(err));

    }

  };



  return (

    <CommunityAdminRoute>

      <DashboardPortalShell title="Contracts" subtitle="Won contracts — open for internal member applications">

        {loading ? <LoadingState /> : contracts.length === 0 ? (

          <EmptyState title="No contracts" description="Win a job application to get a contract." />

        ) : (

          contracts.map((c) => (

            <Card key={c.id} className="mb-3">

              <div className="flex flex-wrap items-start justify-between gap-3">

                <div>

                  <Link href={hrefWithReturn(`/community-admin/contracts/${c.id}`)} className="font-bold hover:text-info">

                    {c.job?.title ?? `Contract #${c.id}`}

                  </Link>

                  <p className="text-sm text-muted">${c.total_amount} · commission {c.commission_percent}%</p>

                </div>

                <StatusBadge status={c.status} kind="contract" />

              </div>

              <div className="mt-3 flex flex-wrap gap-2">

                <Link href={hrefWithReturn(`/community-admin/contracts/${c.id}`)}>

                  <Button variant="outline" size="sm">View Contract</Button>

                </Link>

                {c.status === "pending_assignment" && (

                  <Button variant="gradient" size="sm" className="rounded-full" onClick={() => handleOpen(c.id)}>

                    Open Internally

                  </Button>

                )}

              </div>

            </Card>

          ))

        )}

      </DashboardPortalShell>

    </CommunityAdminRoute>

  );

}



export default function CommunityAdminContractsPage() {

  return (

    <Suspense fallback={<LoadingState />}>

      <ContractsListContent />

    </Suspense>

  );

}

