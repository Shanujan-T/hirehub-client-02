"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { MemberCard } from "@/components/member-card";
import { Badge, Button, Card } from "@/components/ui";
import { getContractApplicants, selectMember } from "@/services/contract";
import type { ContractApplication } from "@/types/contract";

export default function SelectMemberPage() {
  const params = useParams();
  const contractId = Number(params.id);
  const [applications, setApplications] = useState<ContractApplication[]>([]);

  useEffect(() => {
    getContractApplicants(contractId).then(setApplications).catch(console.error);
  }, [contractId]);

  const handleSelect = async (applicationId: number) => {
    try {
      await selectMember(contractId, applicationId);
      toast.success("Member selected");
      setApplications((apps) =>
        apps.map((a) => ({
          ...a,
          status: a.id === applicationId ? "selected" : a.status === "applied" ? "rejected" : a.status,
        }))
      );
    } catch {
      toast.error("Failed to select member");
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Select Member</h1>
          <p className="text-muted">Choose one member to carry out this contract</p>
        </div>
        {applications.map((app) => (
          <Card key={app.id}>
            <div className="flex items-start justify-between">
              {app.member && <MemberCard user={app.member} />}
              <Badge>{app.status}</Badge>
            </div>
            {app.note && <p className="mt-2 text-sm text-muted">{app.note}</p>}
            {app.status === "applied" && (
              <Button className="mt-4" onClick={() => handleSelect(app.id)}>Select</Button>
            )}
          </Card>
        ))}
      </div>
    </AuthenticatedRoute>
  );
}
