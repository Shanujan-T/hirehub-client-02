import type { NavItem } from "@/lib/portal-nav";
import { adminNav } from "@/lib/portal-nav";
import { dashboardNav } from "@/lib/dashboard-nav";
import type { UserRole } from "@/types/user";

export type HeaderNavLink = NavItem;

export type NavDuplicateFlag = {
  href: string;
  headerLabel?: string;
  sidebarLabel: string;
  resolution: "keep-both" | "header-removed" | "review";
  note: string;
};

/** Logged-in main portal header (lg+). My Jobs and My Communities live in the sidebar only. */
export const MAIN_PORTAL_HEADER_NAV: HeaderNavLink[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/communities", label: "Communities" },
];

/**
 * Destinations that appear in both top header and left sidebar.
 * Update when changing either nav; do not assume header is always trimmed.
 */
export function getHeaderSidebarDuplicates(context: "main" | "community-admin" | "admin"): NavDuplicateFlag[] {
  if (context === "main") {
    return [
      {
        href: "/dashboard",
        headerLabel: "Dashboard",
        sidebarLabel: "Dashboard",
        resolution: "keep-both",
        note: "Intentional: header for quick wayfinding, sidebar for full IA and mobile drawer.",
      },
      {
        href: "/member/communities",
        sidebarLabel: "My Communities",
        resolution: "header-removed",
        note: "De-duplicated: memberships live in the sidebar only; header Communities is the public browse link.",
      },
      {
        href: "/jobs",
        sidebarLabel: "My Jobs",
        resolution: "header-removed",
        note: "De-duplicated: sidebar is the single header-adjacent entry for posted jobs.",
      },
      {
        href: "/community-admin/jobs",
        headerLabel: "Job marketplace",
        sidebarLabel: "Browse Jobs",
        resolution: "review",
        note: "Same destination when user admins a community; header link is conditional, sidebar uses community-admin section.",
      },
    ];
  }

  if (context === "community-admin") {
    return [
      {
        href: "/community-admin/dashboard",
        headerLabel: "Dashboard",
        sidebarLabel: "Dashboard",
        resolution: "review",
        note: "Community-admin pages use communityAdminNav in the sidebar; header repeats key destinations.",
      },
      {
        href: "/community-admin/jobs",
        headerLabel: "Browse Jobs",
        sidebarLabel: "Browse Jobs",
        resolution: "review",
        note: "Same label and href in header and sidebar on community-admin routes.",
      },
    ];
  }

  return [
    {
      href: "/admin/dashboard",
      headerLabel: "Dashboard",
      sidebarLabel: adminNav.find((i) => i.href === "/admin/dashboard")?.label ?? "Dashboard",
      resolution: "review",
      note: "Platform admin header is minimal; full tree is in AdminSidebar.",
    },
    {
      href: "/admin/reports",
      headerLabel: "Reports",
      sidebarLabel: "Reports",
      resolution: "review",
      note: "Reports shortcut in header duplicates admin sidebar.",
    },
  ];
}

/** Sidebar href set for the main user portal (excludes dynamic community-admin block). */
export const MAIN_PORTAL_SIDEBAR_HREFS = new Set(dashboardNav.map((item) => item.href));

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

  return MAIN_PORTAL_HEADER_NAV;
}
