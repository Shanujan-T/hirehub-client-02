"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getDashboardPath } from "@/providers/auth-provider";
import type { UserRole } from "@/types/user";

export function AuthenticatedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
    if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.replace(getDashboardPath(user));
    }
  }, [user, loading, allowedRoles, router]);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        Loading...
      </div>
    );
  }

  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}

export function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(getDashboardPath(user));
    }
  }, [user, loading, router]);

  if (loading) return null;
  if (user) return null;

  return <>{children}</>;
}
