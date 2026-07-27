"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Badge, Button, Card } from "@/components/ui";
import { adminApproveDeliverable, getContracts, openContractInternally } from "@/services/contract";
import type { Contract } from "@/types/contract";

export default function CommunityAdminContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);

  const load = () => getContracts().then(setContracts).catch(console.error);
  useEffect(() => { load(); }, []);

  const handleOpen = async (id: number) => {
    await openContractInternally(id);
    toast.success("Contract opened internally");
    load();
  };

  const handleDeliver = async (id: number) => {
    await adminApproveDeliverable(id);
    toast.success("Deliverable forwarded to employer");
    load();
  };

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Community Contracts</h1>
          <p className="text-muted">Open internally, select members, QA deliverables</p>
        </div>
        {contracts.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{c.job?.title ?? `Contract #${c.id}`}</h3>
                <p className="text-sm text-muted">${c.total_amount}</p>
              </div>
              <Badge>{c.status}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {c.status === "pending_assignment" && (
                <Button onClick={() => handleOpen(c.id)}>Open Internally</Button>
              )}
              {c.status === "open_internally" && (
                <Link href={`/community-admin/contracts/${c.id}/applicants`}>
                  <Button variant="outline">Select Member</Button>
                </Link>
              )}
              {c.status === "submitted" && (
                <Button onClick={() => handleDeliver(c.id)}>Forward to Employer</Button>
              )}
              {c.status === "submitted" && c.deliverable_url && (
                <a href={c.deliverable_url} className="text-sm text-primary underline" target="_blank" rel="noreferrer">
                  Review Deliverable
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </AuthenticatedRoute>
  );
}
