"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, getDashboardPath } from "@/providers/auth-provider";
import type { User, UserRole } from "@/types/user";

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
  const [mounted, setMounted] = useState(false);
  const roleRedirectStarted = useRef(false);
  const accessAllowed = user ? isRoleAllowed(user, allowedRoles) : true;
  const dashboardPath = getDashboardPath(user);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted || loading) return;
    if (!user) {
      router.replace("/auth/login");
    }
  }, [mounted, user, loading, router]);

  useEffect(() => {
    if (!mounted || loading || !user || accessAllowed || roleRedirectStarted.current) return;

    const redirectTimer = window.setTimeout(() => {
      roleRedirectStarted.current = true;
      router.replace(dashboardPath);
    }, 750);

    return () => window.clearTimeout(redirectTimer);
  }, [mounted, user, loading, accessAllowed, dashboardPath, router]);

  if (!mounted || loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted">
        Redirecting to login...
      </div>
    );
  }

  if (!accessAllowed) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4">
        <div className="max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-foreground">You don&apos;t have access to this page</h1>
          <p className="mt-2 text-sm text-muted">
            Redirecting you to the dashboard for your account type.
          </p>
          <Link href={dashboardPath} className="mt-4 inline-block font-semibold text-info hover:underline">
            Go to your dashboard
          </Link>
        </div>
      </div>
    );
  }

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
