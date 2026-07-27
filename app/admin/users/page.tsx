"use client";

import { useCallback } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, adminNav } from "@/components/portal-shell";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getUsers } from "@/services/platform";

export default function AdminUsersPage() {
  const { data: users, loading } = useAsyncList(useCallback(() => getUsers(), []));

  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <PortalShell title="Users" subtitle="Platform user directory" navItems={adminNav}>
        {loading ? <LoadingState /> : users.length === 0 ? (
          <EmptyState title="No users" />
        ) : (
          users.map((u) => (
            <Card key={u.id} className="mb-2 flex justify-between">
              <div>
                <p className="font-bold">{u.full_name}</p>
                <p className="text-sm text-muted">{u.email}</p>
              </div>
              <span className="text-sm capitalize text-muted">{u.role}</span>
            </Card>
          ))
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
