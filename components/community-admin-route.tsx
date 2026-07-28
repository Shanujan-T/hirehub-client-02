"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMyMemberships } from "@/services/community";
import { useAuth } from "@/providers/auth-provider";
import { getDashboardPath } from "@/providers/auth-provider";

const ACTIVE_COMMUNITY_KEY = "activeCommunityId";

export function setActiveCommunityId(communityId: number) {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(ACTIVE_COMMUNITY_KEY, String(communityId));
  }
}

function getActiveCommunityId(): number | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(ACTIVE_COMMUNITY_KEY);
  return raw ? Number(raw) : null;
}

export function useCommunityAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [communityId, setCommunityId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;
    getMyMemberships()
      .then((memberships) => {
        const admins = memberships.filter((m) => m.role === "admin" && m.status === "approved");
        const preferredId = getActiveCommunityId();
        const preferred = preferredId
          ? admins.find((m) => m.community_id === preferredId)
          : undefined;
        const admin =
          preferred ?? admins.slice().sort((a, b) => b.community_id - a.community_id)[0];
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
