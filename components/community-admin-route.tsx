"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyMemberships } from "@/services/community";
import { useAuth } from "@/providers/auth-provider";
import { getDashboardPath } from "@/providers/auth-provider";

export function useCommunityAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [communityId, setCommunityId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    getMyMemberships()
      .then((memberships) => {
        const admin = memberships.find((m) => m.role === "admin" && m.status === "approved");
        setCommunityId(admin?.community_id ?? null);
      })
      .finally(() => setLoading(false));
  }, [user, authLoading]);

  return { communityId, isAdmin: communityId !== null, loading: authLoading || loading };
}

export function CommunityAdminRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading } = useCommunityAdmin();

  useEffect(() => {
    if (!authLoading && !user) router.replace("/auth/login");
    if (!loading && user && !isAdmin) router.replace(getDashboardPath(user));
  }, [user, authLoading, isAdmin, loading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">Loading...</div>
    );
  }
  if (!user || !isAdmin) return null;
  return <>{children}</>;
}
