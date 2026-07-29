import type { User } from "@/types/user";
import { communityAdminNav, type NavItem } from "./portal-nav";

export function userAdminsAnyCommunity(user: User | null | undefined): boolean {
  return (
    user?.community_memberships?.some(
      (m) => m.role === "admin" && m.status === "approved"
    ) ?? false
  );
}

/** Shared sidebar for any logged-in platform user (not platform admin portal). */
export const dashboardNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "My Jobs" },
  { href: "/contracts", label: "Contracts (posted)" },
  { href: "/member/communities", label: "My Communities" },
  { href: "/member/contracts", label: "My Contracts" },
  { href: "/member/earnings", label: "Earnings" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function buildDashboardNav(user: User | null | undefined): NavItem[] {
  const items = [...dashboardNav];
  if (userAdminsAnyCommunity(user)) {
    items.push(
      { href: "/community-admin/dashboard", label: "Community Admin" },
      ...communityAdminNav.filter((item) => item.href !== "/community-admin/dashboard")
    );
  }
  return items;
}

/** @deprecated use dashboardNav / buildDashboardNav */
export const clientNav = dashboardNav;

/** @deprecated use dashboardNav / buildDashboardNav */
export const memberNav = dashboardNav;
