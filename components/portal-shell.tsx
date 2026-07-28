"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { AppHeader } from "@/components/app-header";
import { BackButton } from "@/components/back-button";
import { PortalSidebar } from "@/components/portal-sidebar";
import {  adminCommunityNav,
  adminNav,
  communityAdminNav,
  clientNav,
  memberNav,
  platformNav,
  type NavItem,
} from "@/lib/portal-nav";
import { cn } from "@/lib/utils";

export type { NavItem };
export { adminCommunityNav, adminNav, communityAdminNav, clientNav, memberNav, platformNav };

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
  const isAdminPortal = pathname.startsWith("/admin");
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />

      <div className="flex min-h-0 flex-1 items-start">
        {isAdminPortal ? <AdminSidebar /> : <PortalSidebar navItems={navItems} />}
        <div
          className={cn(
            "relative flex min-w-0 flex-1 flex-col",
            isAdminPortal && "dark:bg-admin-portal-base"
          )}
        >
          {isAdminPortal && (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 hidden overflow-hidden dark:block"
            >
              <div className="absolute inset-0 bg-admin-portal-glow opacity-90" />
              <div className="absolute -left-28 top-20 h-[26rem] w-[26rem] rounded-full bg-secondary/18 blur-[110px]" />
              <div className="absolute -right-20 bottom-12 h-[30rem] w-[30rem] rounded-full bg-accent/14 blur-[130px]" />
            </div>
          )}
          <div className="relative z-10 border-b border-border bg-card/95 px-4 py-4 backdrop-blur-sm dark:bg-card/90 lg:px-8">
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
          <div className="relative z-10 flex-1 p-4 lg:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
