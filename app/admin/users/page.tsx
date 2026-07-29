"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, adminNav } from "@/components/portal-shell";
import { EmptyState, LoadingState } from "@/components/page-states";
import { roleBadgeVariant, roleLabel, UserAvatar } from "@/components/user-avatar";
import { Badge, Button, Card, Input, Label, SelectMenu } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/utils";
import { adminSetUserActive, getUsers } from "@/services/platform";
import type { User } from "@/types/user";

const ROLE_FILTER_OPTIONS = [
  { value: "all", label: "All roles" },
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUsersPage() {
  const { data: users, loading, setData } = useAsyncList(useCallback(() => getUsers(), []));
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        user.full_name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        user.role.toLowerCase().includes(q) ||
        roleLabel(user.role).toLowerCase().includes(q)
      );
    });
  }, [users, query, roleFilter]);

  const handleToggleActive = async (user: User) => {
    setTogglingId(user.id);
    try {
      const updated = await adminSetUserActive(user.id, !user.is_active);
      setData((current) => current.map((row) => (row.id === updated.id ? { ...row, ...updated } : row)));
      notify.success(updated.is_active ? "User reactivated" : "User suspended");
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <PortalShell title="Users" subtitle="Platform user directory" navItems={adminNav}>
        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-6">
            <Card className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="user-search">Search</Label>
                <Input
                  id="user-search"
                  placeholder="Name or email"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="user-role-filter">Role</Label>
                <SelectMenu
                  id="user-role-filter"
                  value={roleFilter}
                  onChange={setRoleFilter}
                  options={ROLE_FILTER_OPTIONS}
                />
              </div>
            </Card>

            {filtered.length === 0 ? (
              <EmptyState title="No users match your filters" />
            ) : (
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="border-b border-border bg-background/60 text-left text-xs uppercase tracking-wide text-muted">
                      <tr>
                        <th className="px-4 py-3 font-semibold">User</th>
                        <th className="px-4 py-3 font-semibold">Role</th>
                        <th className="px-4 py-3 font-semibold">Location</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Joined</th>
                        <th className="px-4 py-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((user) => (
                        <tr key={user.id} className="border-b border-border/70 last:border-b-0">
                          <td className="px-4 py-3">
                            <Link
                              href={`/admin/users/${user.id}`}
                              className="flex items-center gap-3 hover:text-info"
                            >
                              <UserAvatar name={user.full_name} avatarUrl={user.avatar_url} size="sm" />
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground">{user.full_name}</p>
                                <p className="truncate text-xs text-muted">{user.email}</p>
                              </div>
                            </Link>
                          </td>
                          <td className="px-4 py-3">
                            <Badge variant={roleBadgeVariant(user.role)}>{roleLabel(user.role)}</Badge>
                          </td>
                          <td className="px-4 py-3 text-muted">{user.location || "—"}</td>
                          <td className="px-4 py-3">
                            <Badge variant={user.is_active ? "completed" : "rejected"}>
                              {user.is_active ? "Active" : "Suspended"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted">{formatDate(user.created_at)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <Link href={`/admin/users/${user.id}`}>
                                <Button variant="outline" size="sm">
                                  View
                                </Button>
                              </Link>
                              <Button
                                variant={user.is_active ? "destructive" : "gradient"}
                                size="sm"
                                disabled={togglingId === user.id}
                                onClick={() => handleToggleActive(user)}
                              >
                                {user.is_active ? "Suspend" : "Reactivate"}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
