"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { UserAvatar } from "@/components/user-avatar";
import { Button } from "@/components/ui";
import { getPortalNavIcon } from "@/lib/portal-nav-icons";
import type { NavItem } from "@/lib/portal-nav";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

function PortalQuickActions() {
  return (
    <div className="space-y-2 px-3 pt-3 pb-3">
      <Link href="/jobs/new" className="block">
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-xl border-border/80 bg-card/50 text-foreground hover:bg-border/40 dark:bg-white/5 dark:hover:bg-white/10"
        >
          Post a Job
        </Button>
      </Link>
      <Link href="/member/communities" className="block">
        <Button
          variant="outline"
          size="sm"
          className="w-full rounded-xl border-border/80 bg-card/50 text-foreground hover:bg-border/40 dark:bg-white/5 dark:hover:bg-white/10"
        >
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
    <div className="mt-auto shrink-0 border-t border-border bg-card p-4 dark:border-white/10 dark:bg-[#0b0f1a]">
      <div className="flex min-w-0 items-center gap-2.5">
        <UserAvatar
          name={user.full_name}
          avatarUrl={user.avatar_url}
          size="sm"
          className="h-9 w-9 text-xs"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{user.full_name}</p>
          <p className="truncate text-xs text-muted">{user.email}</p>
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

  return (
    <nav className="shrink-0 space-y-1 p-3 pt-4">
      {navItems.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = getPortalNavIcon(item.href);
        const isSectionDivider = item.label === "Community Admin";

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
              active
                ? "bg-brand-gradient font-bold text-white shadow-md"
                : "text-muted hover:bg-border/50 hover:text-foreground dark:hover:bg-white/10 dark:hover:text-foreground",
              isSectionDivider && !active && "mt-2 border-t border-border pt-3 dark:border-white/10"
            )}
          >
            <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "opacity-80")} aria-hidden />
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
          "absolute inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col border-r border-border shadow-2xl",
          "bg-card dark:bg-[#0b0f1a]"
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3 dark:border-white/10">
          <BrandLogo href="/dashboard" size="sm" />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted transition hover:bg-border/60 hover:text-foreground dark:hover:bg-white/10"
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
          "border-r border-border bg-card shadow-sm dark:bg-[#0b0f1a]"
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
