import type { LucideIcon } from "lucide-react";
import { Flag, Folder, LayoutDashboard, Users, Building2 } from "lucide-react";

export type NavItem = { href: string; label: string };

export { dashboardNav as clientNav, dashboardNav as memberNav } from "@/lib/dashboard-nav";

export const communityAdminNav: NavItem[] = [
  { href: "/community-admin/dashboard", label: "Dashboard" },
  { href: "/community-admin/my-community", label: "My Community" },
  { href: "/community-admin/open-calls", label: "Open Calls" },
  { href: "/community-admin/jobs", label: "Browse Jobs" },
  { href: "/community-admin/contracts", label: "Contracts" },
  { href: "/community-admin/earnings", label: "Earnings" },
];

export const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/communities", label: "Communities" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/users", label: "Users" },
];

export const ADMIN_NAV_ICONS: Record<string, LucideIcon> = {
  "/admin/dashboard": LayoutDashboard,
  "/admin/categories": Folder,
  "/admin/communities": Building2,
  "/admin/reports": Flag,
  "/admin/users": Users,
};

/** @deprecated use communityAdminNav */
export const adminCommunityNav = communityAdminNav;

/** @deprecated use adminNav */
export const platformNav = adminNav;
