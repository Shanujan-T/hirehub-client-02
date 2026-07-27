"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Badge, Button, Card } from "@/components/ui";
import { approveMember, getCommunityMembers, getMyMemberships, rejectMember } from "@/services/community";
import type { CommunityMember } from "@/types/community";

export default function MyCommunityPage() {
  const [adminCommunityId, setAdminCommunityId] = useState<number | null>(null);
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [pending, setPending] = useState<CommunityMember[]>([]);

  useEffect(() => {
    getMyMemberships().then((m) => {
      const admin = m.find((x) => x.role === "admin" && x.status === "approved");
      if (admin) {
        setAdminCommunityId(admin.community_id);
        getCommunityMembers(admin.community_id, "approved").then(setMembers);
        getCommunityMembers(admin.community_id, "pending").then(setPending);
      }
    });
  }, []);

  const handleApprove = async (id: number) => {
    await approveMember(id);
    toast.success("Member approved");
    if (adminCommunityId) {
      getCommunityMembers(adminCommunityId, "pending").then(setPending);
      getCommunityMembers(adminCommunityId, "approved").then(setMembers);
    }
  };

  const handleReject = async (id: number) => {
    await rejectMember(id);
    toast.success("Request rejected");
    if (adminCommunityId) getCommunityMembers(adminCommunityId, "pending").then(setPending);
  };

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">My Community</h1>
          <p className="text-muted">Manage members and join requests</p>
        </div>
        {pending.length > 0 && (
          <div>
            <h2 className="mb-2 text-xl font-bold">Pending Requests</h2>
            {pending.map((m) => (
              <Card key={m.id} className="mb-2 flex items-center justify-between">
                <span>User #{m.user_id}</span>
                <div className="flex gap-2">
                  <Button onClick={() => handleApprove(m.id)}>Approve</Button>
                  <Button variant="destructive" onClick={() => handleReject(m.id)}>Reject</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
        <div>
          <h2 className="mb-2 text-xl font-bold">Approved Members</h2>
          {members.map((m) => (
            <Card key={m.id} className="mb-2 flex justify-between">
              <span>{m.user?.full_name ?? `User #${m.user_id}`}</span>
              <Badge>{m.role}</Badge>
            </Card>
          ))}
        </div>
      </div>
    </AuthenticatedRoute>
  );
}
