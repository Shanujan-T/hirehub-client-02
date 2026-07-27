"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Badge, Button, Card } from "@/components/ui";
import { getMyMemberships } from "@/services/community";
import { getContracts } from "@/services/contract";
import { getJobs } from "@/services/job";
import type { CommunityMember } from "@/types/community";
import type { Contract } from "@/types/contract";
import type { Job } from "@/types/job";

export default function CommunityAdminDashboardPage() {
  const [memberships, setMemberships] = useState<CommunityMember[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    getMyMemberships().then(setMemberships).catch(console.error);
    getJobs().then(setJobs).catch(console.error);
    getContracts().then(setContracts).catch(console.error);
  }, []);

  const adminCommunity = memberships.find((m) => m.role === "admin" && m.status === "approved");

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Community Admin Dashboard</h1>
          <p className="text-muted">Manage your community, jobs, and contracts</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/community-admin/my-community"><Button variant="outline">My Community</Button></Link>
          <Link href="/community-admin/jobs"><Button variant="outline">Browse Jobs</Button></Link>
          <Link href="/community-admin/contracts"><Button variant="outline">Contracts</Button></Link>
          <Link href="/community-admin/earnings"><Button variant="outline">Earnings</Button></Link>
        </div>
        {adminCommunity && (
          <Card>
            <h3 className="font-semibold">Your Community (ID: {adminCommunity.community_id})</h3>
          </Card>
        )}
        <div>
          <h2 className="mb-2 text-xl font-bold">Open Jobs</h2>
          {jobs.filter((j) => j.status === "open").slice(0, 3).map((job) => (
            <Card key={job.id} className="mb-2">
              <div className="flex justify-between">
                <span>{job.title}</span>
                <Badge>{job.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
        <div>
          <h2 className="mb-2 text-xl font-bold">Active Contracts</h2>
          {contracts.slice(0, 3).map((c) => (
            <Card key={c.id} className="mb-2">
              <div className="flex justify-between">
                <span>{c.job?.title ?? `Contract #${c.id}`}</span>
                <Badge>{c.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AuthenticatedRoute>
  );
}
