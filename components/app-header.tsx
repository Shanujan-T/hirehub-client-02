"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui";
import { getDashboardPath, useAuth } from "@/providers/auth-provider";
import type { User, UserRole } from "@/types/user";
import { cn } from "@/lib/utils";

export type HeaderNavLink = { href: string; label: string };

const linkClass =
  "text-sm text-muted transition hover:text-info focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/30 rounded-sm";

/** Role- and route-aware top nav links (no public jobs browse for members). */
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
      { href: "/communities", label: "Communities" },
    ];
  }

  if (
    pathname.startsWith("/jobs") ||
    pathname.startsWith("/contracts") ||
    pathname.startsWith("/reviews") ||
    pathname === "/dashboard" ||
    role === "employer"
  ) {
    return [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/jobs", label: "My Jobs" },
      { href: "/communities", label: "Communities" },
    ];
  }

  return [
    { href: "/member/dashboard", label: "Dashboard" },
    { href: "/communities", label: "Communities" },
  ];
}

function UserAvatar({ user }: { user: User }) {
  const initials = user.full_name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-bold text-white shadow-sm"
      aria-hidden={!!user.full_name}
      title={user.full_name}
    >
      {initials || "?"}
    </span>
  );
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
                <UserAvatar user={user} />
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
              <Link href="/auth/login" className={linkClass}>
                Login
              </Link>
              <Link href="/auth/register">
                <Button variant="gradient" size="sm" className="rounded-full">
                  Register
                </Button>
              </Link>
            </>
          ) : null}
        </div>
      </nav>
    </header>
  );
}
