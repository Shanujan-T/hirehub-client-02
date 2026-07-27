"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, employerNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { getJob } from "@/services/job";
import type { Job } from "@/types/job";

export default function JobDetailPage() {
  const params = useParams();
  const jobId = Number(params.id);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getJob(jobId).then(setJob).finally(() => setLoading(false));
  }, [jobId]);

  useEffect(() => { load(); }, [load]);

  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalShell title="Job Details" navItems={employerNav}>
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
              <Link href={`/jobs/${job.id}/applicants`} className="mt-4 inline-block">
                <Button variant="gradient" className="rounded-full">View Applicants</Button>
              </Link>
            )}
          </Card>
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
