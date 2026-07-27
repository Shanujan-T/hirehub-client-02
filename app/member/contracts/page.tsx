"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Badge, Button, Card } from "@/components/ui";
import { applyToContract, getContracts } from "@/services/contract";
import type { Contract } from "@/types/contract";

export default function MemberContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    getContracts().then(setContracts).catch(console.error);
  }, []);

  const handleApply = async (contractId: number) => {
    try {
      await applyToContract(contractId);
      toast.success("Applied to contract");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error || "Failed";
      toast.error(msg);
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Contracts</h1>
          <p className="text-muted">Open internal contracts and your assignments</p>
        </div>
        {contracts.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{c.job?.title ?? `Contract #${c.id}`}</h3>
                <p className="text-sm text-muted">{c.job?.description?.slice(0, 100)}...</p>
                {/* No employer info shown — privacy rule */}
              </div>
              <Badge>{c.status}</Badge>
            </div>
            <div className="mt-4 flex gap-2">
              {c.status === "open_internally" && (
                <Button onClick={() => handleApply(c.id)}>Apply</Button>
              )}
              {c.status === "active" && c.assigned_member_id && (
                <Link href={`/member/contracts/${c.id}`}>
                  <Button variant="outline">View & Submit</Button>
                </Link>
              )}
            </div>
          </Card>
        ))}
      </div>
    </AuthenticatedRoute>
  );
}
