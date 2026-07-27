"use client";

import { toast } from "sonner";
import { CommunityAdminRoute, useCommunityAdmin } from "@/components/community-admin-route";
import { PortalShell, communityAdminNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { Button, Card } from "@/components/ui";
import { getErrorMessage } from "@/lib/utils";
import { approveMember, getCommunityMembers, rejectMember } from "@/services/community";
import { useEffect, useState } from "react";
import type { CommunityMember } from "@/types/community";

export default function MyCommunityPage() {
  const { communityId } = useCommunityAdmin();
  const [members, setMembers] = useState<CommunityMember[]>([]);
  const [pending, setPending] = useState<CommunityMember[]>([]);

  const reload = async (cid: number) => {
    setMembers(await getCommunityMembers(cid, "approved"));
    setPending(await getCommunityMembers(cid, "pending"));
  };

  useEffect(() => { if (communityId) reload(communityId).catch(() => toast.error("Failed to load members")); }, [communityId]);

  const handleApprove = async (id: number) => {
    try { await approveMember(id); toast.success("Approved"); if (communityId) reload(communityId); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };

  const handleReject = async (id: number) => {
    try { await rejectMember(id); toast.success("Rejected"); if (communityId) reload(communityId); }
    catch (err) { toast.error(getErrorMessage(err)); }
  };

  return (
    <CommunityAdminRoute>
      <PortalShell title="My Community" subtitle="Approve or reject join requests" navItems={communityAdminNav}>
        {pending.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 font-bold">Pending Requests</h2>
            {pending.map((m) => (
              <Card key={m.id} className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span>{m.user?.full_name ?? `User #${m.user_id}`}</span>
                <div className="flex gap-2">
                  <Button variant="gradient" size="sm" className="rounded-full" onClick={() => handleApprove(m.id)}>Approve</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleReject(m.id)}>Reject</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
        <h2 className="mb-3 font-bold">Members</h2>
        {members.map((m) => (
          <Card key={m.id} className="mb-2 flex justify-between">
            <span>{m.user?.full_name ?? `User #${m.user_id}`}</span>
            <StatusBadge status={m.role === "admin" ? "active" : "open"} kind="member" />
          </Card>
        ))}
      </PortalShell>
    </CommunityAdminRoute>
  );
}
