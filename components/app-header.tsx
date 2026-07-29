"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui";
import { getDashboardPath, useAuth } from "@/providers/auth-provider";
import type { User, UserRole } from "@/types/user";
import { userAdminsAnyCommunity } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

export type HeaderNavLink = { href: string; label: string };

const linkClass =
  "text-sm text-muted transition hover:text-info focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/30 rounded-sm";

function HeaderIntentCtas({ user, pathname }: { user: User | null; pathname: string }) {
  if (user?.role === "admin") {
    return null;
  }

  if (user) {
    return null;
  }

  const isHome = pathname === "/";

  if (isHome) {
    return (
      <>
        <Link href="/jobs/new">
          <Button variant="gradient" size="sm" className="rounded-full">
            Post a Job
          </Button>
        </Link>
        <Link href="/member/communities">
          <Button variant="gradientCommunity" size="sm" className="rounded-full">
            My Communities
          </Button>
        </Link>
        <Link
          href="/auth/login"
          className={cn(linkClass, "text-xs sm:text-sm text-foreground dark:text-white")}
        >
          Log in
        </Link>
        <Link href="/auth/register">
          <Button variant="default" size="sm" className="rounded-full">
            Register
          </Button>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href="/auth/login"
        className={cn(linkClass, "text-xs sm:text-sm text-foreground dark:text-white")}
      >
        Log in
      </Link>
      <Link href="/auth/register">
        <Button variant="default" size="sm" className="rounded-full">
          Register
        </Button>
      </Link>
    </>
  );
}

/** Route-aware top nav links for logged-in users. */
export function getHeaderNavLinks(pathname: string, role: UserRole): HeaderNavLink[] {
  if (pathname.startsWith("/admin") || role === "admin") {
    return [
      { href: "/admin/dashboard", label: "Dashboard" },
      { href: "/admin/reports", label: "Reports" },
    ];
  }

  if (pathname.startsWith("/community-admin")) {
    return [
      { href: "/community-admin/dashboard", label: "Dashboard" },
      { href: "/community-admin/jobs", label: "Browse Jobs" },
      { href: "/communities", label: "Communities" },
    ];
  }

  return [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/jobs", label: "My Jobs" },
    { href: "/member/communities", label: "My Communities" },
    { href: "/communities", label: "Communities" },
  ];
}

export function AppHeader({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const dashboardHref = user ? getDashboardPath(user) : "/";

  return (
    <header
      className={cn(
        "sticky top-[3px] z-50 border-b border-border/70 bg-card/90 shadow-sm shadow-secondary/5 backdrop-blur-md",
        className
      )}
    >
      <div aria-hidden className="h-px w-full bg-brand-gradient opacity-30" />
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-8">
        <BrandLogo href={dashboardHref} size="sm" />

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          {!loading && user ? (
            <>
              {getHeaderNavLinks(pathname, user.role).map((item) => (
                <Link key={item.href} href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              ))}
              {user.role !== "admin" && userAdminsAnyCommunity(user) && (
                <Link href="/community-admin/jobs" className={linkClass}>
                  Job marketplace
                </Link>
              )}
              <button
                type="button"
                aria-label="Notifications"
                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition hover:bg-border/50 hover:text-info"
                disabled
                title="Notifications coming soon"
              >
                <Bell className="h-4 w-4" aria-hidden />
              </button>
              <ThemeToggle />
              <div className="hidden items-center gap-2 sm:flex">
                <UserAvatar
                  name={user.full_name}
                  avatarUrl={user.avatar_url}
                  size="sm"
                  className="h-8 w-8 text-xs"
                />
                <span className="max-w-[140px] truncate text-sm font-medium text-foreground">
                  {user.full_name}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={logout}
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" aria-hidden />
                Sign out
              </Button>
            </>
          ) : !loading ? (
            <>
              <Link href="/communities" className={linkClass}>
                Communities
              </Link>
              <ThemeToggle />
              <HeaderIntentCtas user={null} pathname={pathname} />
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
