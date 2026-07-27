"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Badge, Button, Card } from "@/components/ui";
import { getJobs } from "@/services/job";
import type { Job } from "@/types/job";

export default function EmployerDashboardPage() {
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    getJobs().then(setJobs).catch(console.error);
  }, []);

  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Employer Dashboard</h1>
            <p className="text-muted">Manage your jobs and contracts</p>
          </div>
          <Link href="/jobs/new">
            <Button>Post Job</Button>
          </Link>
        </div>
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{job.title}</h3>
                  <p className="text-sm text-muted">{job.location} · ${job.final_price}</p>
                </div>
                <Badge>{job.status}</Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Link href={`/jobs/${job.id}`}>
                  <Button variant="outline" className="text-xs">View</Button>
                </Link>
                {job.status === "open" && (
                  <Link href={`/jobs/${job.id}/applicants`}>
                    <Button variant="outline" className="text-xs">Applicants</Button>
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
        <Link href="/contracts">
          <Button variant="outline">View Contracts</Button>
        </Link>
      </div>
    </AuthenticatedRoute>
  );
}
