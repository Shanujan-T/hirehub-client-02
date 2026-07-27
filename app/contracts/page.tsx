"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Badge, Button, Card } from "@/components/ui";
import { employerApproveDeliverable, getContracts } from "@/services/contract";
import type { Contract } from "@/types/contract";

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    getContracts().then(setContracts).catch(console.error);
  }, []);

  const handleApprove = async (contractId: number) => {
    try {
      await employerApproveDeliverable(contractId);
      toast.success("Deliverable approved. Payment released.");
      setContracts((c) =>
        c.map((x) => (x.id === contractId ? { ...x, status: "completed" as const } : x))
      );
    } catch {
      toast.error("Failed to approve");
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["employer"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">My Contracts</h1>
          <p className="text-muted">Review deliverables and release payment</p>
        </div>
        {contracts.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{c.job?.title}</h3>
                <p className="text-sm text-muted">{c.community?.name} · ${c.total_amount}</p>
                {c.deliverable_url && (
                  <a href={c.deliverable_url} className="text-sm text-primary underline" target="_blank" rel="noreferrer">
                    View Deliverable
                  </a>
                )}
              </div>
              <Badge>{c.status}</Badge>
            </div>
            <div className="mt-4 flex gap-2">
              {c.status === "submitted" && (
                <Button onClick={() => handleApprove(c.id)}>Approve & Pay</Button>
              )}
              {c.status === "completed" && (
                <Link href={`/reviews/${c.id}`}>
                  <Button variant="outline">Leave Review</Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </AuthenticatedRoute>
  );
}
