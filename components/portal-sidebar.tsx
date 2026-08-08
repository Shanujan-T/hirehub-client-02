"use client";



import Link from "next/link";

import { usePathname } from "next/navigation";

import { useEffect, useState } from "react";

import { X } from "lucide-react";

import { BrandLogo } from "@/components/brand-logo";

import { UserAvatar } from "@/components/user-avatar";

import { Button } from "@/components/ui";

import { getPortalNavIcon } from "@/lib/portal-nav-icons";

import type { NavItem } from "@/lib/portal-nav";

import { useAuth } from "@/providers/auth-provider";

import { cn } from "@/lib/utils";



/** Shared surface + nav tokens — one theme on desktop sidebar and mobile drawer. */

const portalSidebarSurface = cn(

  "border-border bg-portal-sidebar text-foreground",

  "dark:border-border"

);



const portalSidebarFooter = "mt-auto shrink-0 border-t border-border p-4";



const portalNavInactive = cn(

  "text-portal-sidebar-muted hover:bg-portal-sidebar-hover hover:text-foreground",

  "dark:hover:text-foreground"

);



const portalQuickActionButton = cn(

  "w-full rounded-xl border-border/80 bg-background text-foreground",

  "hover:bg-portal-sidebar-hover",

  "dark:border-border/80 dark:bg-white/5 dark:hover:bg-white/10"

);



function PortalQuickActions() {

  return (

    <div className="space-y-2 px-3 pt-3 pb-3">

      <Link href="/jobs/new" className="block">

        <Button variant="outline" size="sm" className={portalQuickActionButton}>

          Post a Job

        </Button>

      </Link>

      <Link href="/member/communities" className="block">

        <Button variant="outline" size="sm" className={portalQuickActionButton}>

          Join a Community

        </Button>

      </Link>

    </div>

  );

}



function PortalNavFooter() {

  const { user } = useAuth();

  if (!user) return null;



  return (

    <div className={portalSidebarFooter}>

      <div className="flex min-w-0 items-center gap-2.5">

        <UserAvatar

          name={user.full_name}

          avatarUrl={user.avatar_url}

          size="sm"

          className="h-9 w-9 text-xs"

        />

        <div className="min-w-0 flex-1">

          <p className="truncate text-sm font-medium text-foreground">{user.full_name}</p>

          <p className="truncate text-xs text-portal-sidebar-muted">{user.email}</p>

        </div>

      </div>

    </div>

  );

}



function PortalNavList({

  navItems,

  onNavigate,

}: {

  navItems: NavItem[];

  onNavigate?: () => void;

}) {

  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const updateHash = () => setHash(window.location.hash);
    updateHash();
    window.addEventListener("hashchange", updateHash);
    window.addEventListener("profile-anchor-navigation", updateHash);
    return () => {
      window.removeEventListener("hashchange", updateHash);
      window.removeEventListener("profile-anchor-navigation", updateHash);
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/member/profile") return;

    const sectionIds = ["profile", "skills", "account-verification"];
    let frame: number | undefined;
    let hashTimer: number | undefined;
    const updateActiveSection = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const marker = window.innerHeight * 0.35;
        const activeId = sectionIds.reduce((current, id) => {
          const section = document.getElementById(id);
          return section && section.getBoundingClientRect().top <= marker ? id : current;
        }, "profile");
        const nextHash = `#${activeId}`;

        setHash(nextHash);
        if (hashTimer !== undefined) window.clearTimeout(hashTimer);
        hashTimer = window.setTimeout(() => {
          if (window.location.hash !== nextHash) {
            window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}${nextHash}`);
          }
        }, 150);
      });
    };

    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      if (hashTimer !== undefined) window.clearTimeout(hashTimer);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [pathname]);



  return (

    <nav className="shrink-0 space-y-1 p-3 pt-4">

      {navItems.map((item) => {

        const [itemPath, itemHash = ""] = item.href.split("#");
        const active = itemHash
          ? pathname === itemPath && (hash === `#${itemHash}` || (itemHash === "profile" && !hash))
          : pathname === itemPath || pathname.startsWith(`${itemPath}/`);

        const Icon = getPortalNavIcon(item.href);

        const isSectionDivider = item.label === "Community Admin";



        return (

          <Link

            key={item.href}

            href={item.href}

            onClick={() => {
              onNavigate?.();
              if (item.href.startsWith("/member/profile#")) {
                // Next client navigation can update the hash without triggering
                // the browser's native anchor scroll.
                window.setTimeout(() => {
                  window.dispatchEvent(new Event("profile-anchor-navigation"));
                }, 0);
              }
            }}

            className={cn(

              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",

              active ? "bg-brand-gradient font-bold text-white shadow-md" : portalNavInactive,

              isSectionDivider && !active && "mt-2 border-t border-border pt-3"

            )}

          >

            <Icon

              className={cn(

                "h-4 w-4 shrink-0",

                active ? "text-white" : "text-portal-sidebar-muted"

              )}

              aria-hidden

            />

            <span className="truncate">{item.label}</span>

          </Link>

        );

      })}

    </nav>

  );

}



/** Nav links + quick actions (scrollable region above pinned footer). */

function PortalNavScrollRegion({

  navItems,

  onNavigate,

}: {

  navItems: NavItem[];

  onNavigate?: () => void;

}) {

  return (

    <>

      <PortalNavList navItems={navItems} onNavigate={onNavigate} />

      <PortalQuickActions />

    </>

  );

}



export function PortalMobileDrawer({

  open,

  onClose,

  navItems,

}: {

  open: boolean;

  onClose: () => void;

  navItems: NavItem[];

}) {

  if (!open) return null;



  return (

    <div className="fixed inset-0 z-[100] lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">

      <button

        type="button"

        aria-label="Close menu"

        className="absolute inset-0 bg-black/55 backdrop-blur-[2px]"

        onClick={onClose}

      />

      <aside

        className={cn(

          "absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col border-r shadow-2xl",

          portalSidebarSurface

        )}

      >

        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">

          <BrandLogo href="/dashboard" size="sm" />

          <button

            type="button"

            onClick={onClose}

            aria-label="Close navigation"

            className="flex h-9 w-9 items-center justify-center rounded-xl text-portal-sidebar-muted transition hover:bg-portal-sidebar-hover hover:text-foreground"

          >

            <X className="h-5 w-5" aria-hidden />

          </button>

        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">

          <div className="min-h-0 flex-1 overflow-y-auto">

            <PortalNavScrollRegion navItems={navItems} onNavigate={onClose} />

          </div>

          <PortalNavFooter />

        </div>

      </aside>

    </div>

  );

}



/** Sticky viewport sidebar — desktop (lg+). */

export function PortalSidebar({ navItems }: { navItems: NavItem[] }) {

  return (

    <div className="relative hidden w-64 shrink-0 self-stretch lg:block">

      <aside

        className={cn(

          "sticky top-[calc(3px+4rem)] z-10 flex h-[calc(100vh-3px-4rem)] w-64 flex-col overflow-hidden",

          "border-r shadow-sm",

          portalSidebarSurface

        )}

      >

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">

          <div className="min-h-0 flex-1 overflow-y-auto">

            <PortalNavScrollRegion navItems={navItems} />

          </div>

          <PortalNavFooter />

        </div>

      </aside>

    </div>

  );

}

