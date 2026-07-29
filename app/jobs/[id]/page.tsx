"use client";



import Link from "next/link";

import { Suspense } from "react";

import { useParams } from "next/navigation";

import { useCallback, useEffect, useState } from "react";

import { AuthenticatedRoute } from "@/components/auth-guard";

import { DashboardPortalShell } from "@/components/portal-shell";

import { StatusBadge } from "@/components/status-badge";

import { LoadingState } from "@/components/page-states";

import { Button, Card } from "@/components/ui";

import { useListNavigation } from "@/lib/hooks/use-list-navigation";

import { getJob } from "@/services/job";

import type { Job } from "@/types/job";



function JobDetailContent() {

  const params = useParams();

  const jobId = Number(params.id);

  const { hrefWithReturn } = useListNavigation();

  const [job, setJob] = useState<Job | null>(null);

  const [loading, setLoading] = useState(true);



  const load = useCallback(() => {

    setLoading(true);

    getJob(jobId).then(setJob).finally(() => setLoading(false));

  }, [jobId]);



  useEffect(() => { load(); }, [load]);



  return (

    <AuthenticatedRoute>

      <DashboardPortalShell title="Job Details" backHref="/jobs" backLabel="Back to jobs">

        {loading || !job ? <LoadingState /> : (

          <Card>

            <div className="mb-4 flex items-start justify-between">

              <h2 className="text-xl font-bold">{job.title}</h2>

              <StatusBadge status={job.status} kind="job" />

            </div>

            <p className="text-sm text-muted">{job.location} · ${job.final_price}</p>

            {job.suggested_price != null && <p className="text-sm text-muted">Suggested: ${job.suggested_price}</p>}

            <p className="mt-4">{job.description}</p>

            {job.status === "open" && (

              <Link href={hrefWithReturn(`/jobs/${job.id}/applicants`)} className="mt-4 inline-block">

                <Button variant="gradient" className="rounded-full">View Applicants</Button>

              </Link>

            )}

          </Card>

        )}

      </DashboardPortalShell>

    </AuthenticatedRoute>

  );

}



export default function JobDetailPage() {

  return (

    <Suspense fallback={<LoadingState />}>

      <JobDetailContent />

    </Suspense>

  );

}

