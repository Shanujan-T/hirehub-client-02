import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  CircleDollarSign,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Megaphone,
  Search,
  Shield,
  User,
  Users,
} from "lucide-react";

/** Leading icons for dashboard / community-admin portal sidebar links. */
export const PORTAL_NAV_ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/jobs": Briefcase,
  "/contracts": FileText,
  "/member/communities": Users,
  "/member/contracts": ClipboardList,
  "/member/earnings": CircleDollarSign,
  "/dashboard/profile": User,
  "/community-admin/dashboard": LayoutDashboard,
  "/community-admin/my-community": Building2,
  "/community-admin/open-calls": Megaphone,
  "/community-admin/jobs": Search,
  "/community-admin/contracts": FileText,
  "/community-admin/earnings": CircleDollarSign,
};

export function getPortalNavIcon(href: string): LucideIcon {
  if (PORTAL_NAV_ICONS[href]) return PORTAL_NAV_ICONS[href];
  if (href.startsWith("/community-admin")) return Shield;
  return LayoutDashboard;
}
