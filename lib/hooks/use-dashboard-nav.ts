"use client";

import { useMemo } from "react";
import { useAuth } from "@/providers/auth-provider";
import { buildDashboardNav } from "@/lib/dashboard-nav";
import type { NavItem } from "@/lib/portal-nav";

export function useDashboardNav(): NavItem[] {
  const { user } = useAuth();
  return useMemo(() => buildDashboardNav(user), [user]);
}
