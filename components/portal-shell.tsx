"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { BackButton } from "@/components/back-button";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string };

export const employerNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "My Jobs" },
  { href: "/jobs/new", label: "Post Job" },
  { href: "/contracts", label: "Contracts" },
];

export const communityAdminNav: NavItem[] = [
  { href: "/community-admin/dashboard", label: "Dashboard" },
  { href: "/community-admin/my-community", label: "My Community" },
  { href: "/community-admin/open-calls", label: "Open Calls" },
  { href: "/community-admin/jobs", label: "Browse Jobs" },
  { href: "/community-admin/contracts", label: "Contracts" },
  { href: "/community-admin/earnings", label: "Earnings" },
];

export const memberNav: NavItem[] = [
  { href: "/member/dashboard", label: "Dashboard" },
  { href: "/member/profile", label: "Profile" },
  { href: "/member/communities", label: "Communities" },
  { href: "/member/contracts", label: "Contracts" },
  { href: "/member/earnings", label: "Earnings" },
];

export const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/users", label: "Users" },
];

/** @deprecated use communityAdminNav */
export const adminCommunityNav = communityAdminNav;

/** @deprecated use adminNav */
export const platformNav = adminNav;

export function PortalShell({
  title,
  subtitle,
  navItems,
  children,
  actions,
  backHref,
  backLabel,
}: {
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  children: React.ReactNode;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 flex-col bg-primary text-white lg:flex">
          <nav className="flex-1 space-y-1 p-3 pt-5">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    active ? "bg-brand-gradient font-bold shadow-md" : "text-white/75 hover:bg-white/10"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="border-t border-white/10 p-4">
            <p className="truncate text-xs text-white/60">{user?.email}</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-border bg-card/95 px-4 py-4 backdrop-blur-sm lg:px-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                {backHref && (
                  <Suspense fallback={null}>
                    <BackButton fallbackHref={backHref} label={backLabel} className="mb-1" />
                  </Suspense>
                )}
                <h1 className="text-2xl font-extrabold text-primary dark:text-foreground">{title}</h1>
                {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
              </div>
              {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
            </div>
          </div>
          <div className="flex-1 p-4 lg:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
