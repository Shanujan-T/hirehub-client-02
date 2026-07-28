"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, adminNav } from "@/components/portal-shell";
import { EmptyState, LoadingState } from "@/components/page-states";
import { roleBadgeVariant, roleLabel, UserAvatar } from "@/components/user-avatar";
import { Badge, Button, Card } from "@/components/ui";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/utils";
import { adminSetUserActive, getUser } from "@/services/platform";
import type { User } from "@/types/user";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUser(await getUser(userId));
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to load user"));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) void load();
  }, [load, userId]);

  const handleToggleActive = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updated = await adminSetUserActive(user.id, !user.is_active);
      setUser((current) => (current ? { ...current, ...updated } : current));
      notify.success(updated.is_active ? "User reactivated" : "User suspended");
    } catch (err) {
      notify.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <PortalShell
        title="User Details"
        subtitle={user ? user.full_name : "Loading user profile"}
        navItems={adminNav}
        backHref="/admin/users"
        backLabel="Back to users"
        actions={
          user ? (
            <Button
              variant={user.is_active ? "destructive" : "gradient"}
              size="sm"
              className="rounded-full"
              disabled={saving}
              onClick={handleToggleActive}
            >
              {user.is_active ? "Suspend" : "Reactivate"}
            </Button>
          ) : undefined
        }
      >
        {loading ? (
          <LoadingState />
        ) : !user ? (
          <EmptyState title="User not found" />
        ) : (
          <div className="space-y-6">
            <Card className="flex flex-wrap items-start gap-4">
              <UserAvatar name={user.full_name} avatarUrl={user.avatar_url} size="lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-extrabold text-foreground">{user.full_name}</h2>
                  <Badge variant={roleBadgeVariant(user.role)}>{roleLabel(user.role)}</Badge>
                  <Badge variant={user.is_active ? "completed" : "rejected"}>
                    {user.is_active ? "Active" : "Suspended"}
                  </Badge>
                </div>
                <p className="text-sm text-muted">{user.email}</p>
                <p className="text-sm text-muted">Joined {formatDate(user.created_at)}</p>
              </div>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card className="space-y-3">
                <h3 className="font-bold text-foreground">Profile</h3>
                <p className="text-sm">
                  <span className="text-muted">Location:</span> {user.location || "Not set"}
                </p>
                <p className="text-sm leading-relaxed text-foreground">{user.bio || "No bio provided."}</p>
              </Card>

              <Card className="space-y-3">
                <h3 className="font-bold text-foreground">Reputation</h3>
                {user.role === "user" ? (
                  <>
                    <p className="text-sm">
                      <span className="text-muted">Rating:</span>{" "}
                      <span className="font-semibold">★ {user.rating?.toFixed(1) ?? "0.0"}</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-muted">Completed projects:</span>{" "}
                      <span className="font-semibold">{user.completed_project_count ?? 0}</span>
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted">Ratings apply to member accounts only.</p>
                )}
              </Card>
            </div>

            {user.role === "user" && (
              <Card className="space-y-3">
                <h3 className="font-bold text-foreground">Skills</h3>
                {user.user_skills && user.user_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.user_skills.map((skill) => (
                      <span key={skill.id} className="inline-flex items-center gap-1">
                        <Badge variant="info">{skill.skill?.name ?? "Skill"}</Badge>
                        <Badge variant="default" className="text-[10px] normal-case">
                          {skill.level}
                        </Badge>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted">No skills listed.</p>
                )}
              </Card>
            )}

            <Card className="space-y-3">
              <h3 className="font-bold text-foreground">Community memberships</h3>
              {user.community_memberships && user.community_memberships.length > 0 ? (
                <div className="space-y-2">
                  {user.community_memberships.map((membership) => (
                    <div
                      key={membership.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {membership.community?.name ?? `Community #${membership.community_id}`}
                        </p>
                        <p className="text-xs capitalize text-muted">
                          {membership.role} · {membership.status}
                        </p>
                      </div>
                      {membership.joined_at && (
                        <p className="text-xs text-muted">Joined {formatDate(membership.joined_at)}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted">No community memberships.</p>
              )}
            </Card>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push("/admin/users")}>
                Back to list
              </Button>
            </div>
          </div>
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
