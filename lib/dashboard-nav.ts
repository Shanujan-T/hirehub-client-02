import type { User } from "@/types/user";
import { communityAdminNav, type NavItem } from "./portal-nav";

export function userAdminsAnyCommunity(user: User | null | undefined): boolean {
  return (
    user?.community_memberships?.some(
      (m) => m.role === "admin" && m.status === "approved"
    ) ?? false
  );
}

export const userNav: NavItem[] = [
  { href: "/user/dashboard", label: "Dashboard" },
  { href: "/user/jobs", label: "My Jobs" },
  { href: "/user/contracts", label: "Contracts (posted)" },
  { href: "/user/dashboard/profile", label: "Profile" },
];

export const employerNav: NavItem[] = [
  { href: "/employer/dashboard", label: "Dashboard" },
  { href: "/employer/communities", label: "My Communities" },
  { href: "/employer/my-contracts", label: "My Contracts" },
  { href: "/employer/earnings", label: "Earnings" },
  { href: "/employer/profile#profile", label: "Profile" },
  { href: "/employer/profile#skills", label: "Skills" },
  { href: "/employer/profile#account-verification", label: "Account Verification" },
];

export const dashboardNav = userNav;

export function buildDashboardNav(user: User | null | undefined): NavItem[] {
  const items = user?.role === "employer" ? [...employerNav] : [...userNav];
  if (user?.role === "employer" && userAdminsAnyCommunity(user)) {
    items.push(
      ...communityAdminNav
    );
  }
  return items;
}

/** @deprecated use dashboardNav / buildDashboardNav */
export const clientNav = dashboardNav;

/** @deprecated use dashboardNav / buildDashboardNav */
export const memberNav = employerNav;
