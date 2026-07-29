"use client";

import { createContext, useContext } from "react";
import type { NavItem } from "@/lib/portal-nav";

type PortalNavContextValue = {
  navItems: NavItem[];
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
};

const PortalNavContext = createContext<PortalNavContextValue | null>(null);

export function PortalNavProvider({
  navItems,
  mobileOpen,
  setMobileOpen,
  children,
}: PortalNavContextValue & { children: React.ReactNode }) {
  return (
    <PortalNavContext.Provider value={{ navItems, mobileOpen, setMobileOpen }}>
      {children}
    </PortalNavContext.Provider>
  );
}

export function usePortalNav() {
  return useContext(PortalNavContext);
}
