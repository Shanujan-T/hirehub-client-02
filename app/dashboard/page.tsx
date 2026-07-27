"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useCallback } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, employerNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getJobs } from "@/services/job";

export default function EmployerDashboardPage() {
  const { data: jobs, loading } = useAsyncList(useCallback(() => getJobs(), []));

  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <PortalShell
        title="Employer Dashboard"
        subtitle="Post jobs and manage community applications"
        navItems={employerNav}
        actions={
          <Link href="/jobs/new">
            <Button variant="gradient" size="sm" className="rounded-full"><Plus className="mr-1 h-4 w-4" />Post Job</Button>
          </Link>
        }
      >
        {loading ? <LoadingState /> : jobs.length === 0 ? (
          <EmptyState title="No jobs yet" description="Post your first job for communities to apply." />
        ) : (
          <div className="grid gap-4">
            {jobs.slice(0, 5).map((job) => (
              <Card key={job.id}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/jobs/${job.id}`} className="font-bold text-primary hover:text-info dark:text-foreground">{job.title}</Link>
                    <p className="text-sm text-muted">{job.location} · ${job.final_price}</p>
                  </div>
                  <StatusBadge status={job.status} kind="job" />
                </div>
                {job.status === "open" && (
                  <Link href={`/jobs/${job.id}/applicants`} className="mt-3 inline-block">
                    <Button variant="outline" size="sm">View Applicants</Button>
                  </Link>
                )}
              </Card>
            ))}
            <Link href="/jobs"><Button variant="ghost">View all jobs →</Button></Link>
          </div>
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
