"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import type { NavItem } from "@/lib/portal-nav";
import { cn } from "@/lib/utils";

/** Sticky viewport sidebar + full-height rail — same pattern as AdminSidebar. */
export function PortalSidebar({ navItems }: { navItems: NavItem[] }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="relative hidden w-64 shrink-0 self-stretch lg:block">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-primary" />

      <aside className="relative sticky top-[calc(3px+4rem)] z-10 flex h-[calc(100vh-3px-4rem)] w-64 flex-col overflow-x-hidden overflow-y-auto text-white shadow-xl shadow-black/20">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-primary" />

        <nav className="relative z-10 shrink-0 space-y-1 p-3 pt-5">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active ? "bg-brand-gradient font-bold shadow-md" : "text-white/75 hover:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative z-10 min-h-0 flex-1" aria-hidden />

        <div className="relative z-10 mt-auto shrink-0 border-t border-white/10 p-4">
          <p className="truncate text-xs text-white/60">{user?.email}</p>
        </div>
      </aside>
    </div>
  );
}
