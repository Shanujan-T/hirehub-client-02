import type { LucideIcon } from "lucide-react";
import { Flag, Folder, LayoutDashboard, Users } from "lucide-react";

export type NavItem = { href: string; label: string };

export const clientNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs", label: "My Jobs" },
  { href: "/jobs/new", label: "Post Job" },
  { href: "/contracts", label: "Contracts" },
  { href: "/dashboard/profile", label: "Profile" },
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

export const ADMIN_NAV_ICONS: Record<string, LucideIcon> = {
  "/admin/dashboard": LayoutDashboard,
  "/admin/categories": Folder,
  "/admin/reports": Flag,
  "/admin/users": Users,
};

/** @deprecated use communityAdminNav */
export const adminCommunityNav = communityAdminNav;

/** @deprecated use adminNav */
export const platformNav = adminNav;
