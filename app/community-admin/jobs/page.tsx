"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Badge, Button, Card } from "@/components/ui";
import { getMyMemberships } from "@/services/community";
import { applyToJob, getJobs } from "@/services/job";
import type { Job } from "@/types/job";

export default function CommunityAdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [communityId, setCommunityId] = useState<number | null>(null);

  useEffect(() => {
    getJobs().then(setJobs).catch(console.error);
    getMyMemberships().then((m) => {
      const admin = m.find((x) => x.role === "admin" && x.status === "approved");
      if (admin) setCommunityId(admin.community_id);
    });
  }, []);

  const handleApply = async (jobId: number) => {
    if (!communityId) return;
    try {
      await applyToJob(jobId, communityId);
      toast.success("Applied on behalf of community");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed";
      toast.error(msg);
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Browse Jobs</h1>
          <p className="text-muted">Apply to jobs on behalf of your community</p>
        </div>
        {jobs.map((job) => (
          <Card key={job.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{job.title}</h3>
                <p className="text-sm text-muted">{job.location} · ${job.final_price}</p>
              </div>
              <Badge>{job.status}</Badge>
            </div>
            <p className="mt-2 text-sm">{job.description}</p>
            {job.status === "open" && (
              <Button className="mt-4" onClick={() => handleApply(job.id)}>Apply as Community</Button>
            )}
          </Card>
        ))}
      </div>
    </AuthenticatedRoute>
  );
}
