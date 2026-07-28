"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getDashboardPath } from "@/providers/auth-provider";
import type { User, UserRole } from "@/types/user";

function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function isRoleAllowed(user: User, allowedRoles?: UserRole[]) {
  return !allowedRoles || allowedRoles.includes(user.role);
}

export function AuthenticatedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const storedUser = getStoredUser();
  const sessionUser = user ?? storedUser;

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
      return;
    }
    if (!loading && user && !isRoleAllowed(user, allowedRoles)) {
      router.replace(getDashboardPath(user));
    }
  }, [user, loading, allowedRoles, router]);

  if (loading && !sessionUser) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        Loading...
      </div>
    );
  }

  if (!loading && !user) return null;
  if (user && !isRoleAllowed(user, allowedRoles)) return null;
  if (loading && sessionUser && !isRoleAllowed(sessionUser, allowedRoles)) return null;

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
