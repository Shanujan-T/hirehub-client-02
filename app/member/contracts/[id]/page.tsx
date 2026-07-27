"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Badge, Button, Card, Input, Label } from "@/components/ui";
import { getContract, submitDeliverable } from "@/services/contract";
import type { Contract } from "@/types/contract";

export default function MemberContractDetailPage() {
  const params = useParams();
  const contractId = Number(params.id);
  const [contract, setContract] = useState<Contract | null>(null);
  const [deliverableUrl, setDeliverableUrl] = useState("");

  useEffect(() => {
    getContract(contractId).then(setContract).catch(console.error);
  }, [contractId]);

  const handleSubmit = async () => {
    try {
      await submitDeliverable(contractId, deliverableUrl);
      toast.success("Deliverable submitted to admin");
      getContract(contractId).then(setContract);
    } catch {
      toast.error("Failed to submit");
    }
  };

  if (!contract) return <p className="text-muted">Loading...</p>;

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">{contract.job?.title}</h1>
          <p className="text-muted">Task details (employer identity hidden)</p>
          <Badge className="mt-2">{contract.status}</Badge>
        </div>
        <Card>
          <h3 className="font-semibold">Scope</h3>
          <p className="mt-2 text-sm">{contract.job?.description}</p>
          <p className="mt-2 text-sm text-muted">Location: {contract.job?.location}</p>
          {/* employer_id intentionally absent from member-facing contract type */}
        </Card>
        {contract.status === "active" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Deliverable URL</Label>
              <Input value={deliverableUrl} onChange={(e) => setDeliverableUrl(e.target.value)} placeholder="https://..." />
            </div>
            <Button onClick={handleSubmit}>Submit to Admin</Button>
          </div>
        )}
      </div>
    </AuthenticatedRoute>
  );
}
