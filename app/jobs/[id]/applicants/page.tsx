"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { MemberCard } from "@/components/member-card";
import { Badge, Button, Card } from "@/components/ui";
import { approveCommunity, getJobApplicants } from "@/services/job";
import type { CommunityApplication } from "@/types/job";

export default function JobApplicantsPage() {
  const params = useParams();
  const jobId = Number(params.id);
  const [applications, setApplications] = useState<CommunityApplication[]>([]);

  useEffect(() => {
    getJobApplicants(jobId).then(setApplications).catch(console.error);
  }, [jobId]);

  const handleApprove = async (applicationId: number) => {
    try {
      await approveCommunity(applicationId);
      toast.success("Community approved. Contract created.");
      setApplications((apps) =>
        apps.map((a) => ({
          ...a,
          status: a.id === applicationId ? "approved" : a.status === "applied" ? "rejected" : a.status,
        }))
      );
    } catch {
      toast.error("Failed to approve");
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Applying Communities</h1>
          <p className="text-muted">Review community members before approving</p>
        </div>
        {applications.map((app) => (
          <Card key={app.id} className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">{app.community?.name}</h3>
              <Badge>{app.status}</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {app.community?.members?.map((m) =>
                m.user ? <MemberCard key={m.id} user={m.user} /> : null
              )}
            </div>
            {app.status === "applied" && (
              <Button onClick={() => handleApprove(app.id)}>Approve Community</Button>
            )}
          </Card>
        ))}
      </div>
    </AuthenticatedRoute>
  );
}
