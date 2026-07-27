"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui";
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
}: {
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col bg-primary text-white lg:flex">
        <div className="border-b border-white/10 p-5">
          <Link href="/" className="text-lg font-extrabold">LocalJobFinder</Link>
        </div>
        <nav className="flex-1 space-y-1 p-3">
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
          <Button variant="ghost" size="sm" onClick={logout} className="mt-2 w-full justify-start text-white/80 hover:bg-white/10">
            <LogOut className="mr-2 h-4 w-4" />Sign out
          </Button>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-border bg-card px-4 py-4 lg:px-8">
          <div>
            <h1 className="text-2xl font-extrabold text-primary dark:text-foreground">{title}</h1>
            {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {actions}
            <ThemeToggle />
          </div>
        </header>
        <div className="flex-1 p-4 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
