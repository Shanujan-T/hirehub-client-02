"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Flag, LayoutDashboard } from "lucide-react";
import { UserAvatar } from "@/components/user-avatar";
import { ADMIN_NAV_ICONS, adminNav } from "@/lib/portal-nav";
import { useAuth } from "@/providers/auth-provider";
import { getReports } from "@/services/platform";
import { cn } from "@/lib/utils";

/** Full-height rail + sticky viewport sidebar — background fills the column on long pages. */
export function AdminSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [openReports, setOpenReports] = useState<number | null>(null);

  useEffect(() => {
    getReports()
      .then((reports) => setOpenReports(reports.filter((report) => report.status === "open").length))
      .catch(() => setOpenReports(null));
  }, []);

  return (
    <div className="relative hidden w-64 shrink-0 self-stretch lg:block">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-admin-sidebar" />

      <aside className="relative sticky top-[calc(3px+4rem)] z-10 flex h-[calc(100vh-3px-4rem)] w-64 flex-col overflow-x-hidden overflow-y-auto text-white shadow-xl shadow-black/25">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-admin-sidebar" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-[0.06]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-admin-sidebar-texture opacity-[0.35]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-[36%] h-44 w-44 rounded-full bg-secondary/18 blur-[72px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 bottom-[22%] h-52 w-52 rounded-full bg-accent/14 blur-[88px]"
        />

        <nav className="relative z-10 shrink-0 space-y-1 p-3 pt-5">
          {adminNav.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = ADMIN_NAV_ICONS[item.href] ?? LayoutDashboard;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-brand-gradient font-bold text-white shadow-md"
                    : "text-white/75 hover:bg-white/12 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative z-10 min-h-0 flex-1" aria-hidden />

        <div className="relative z-10 mt-auto shrink-0 border-t border-white/10 bg-[#041638]/40 p-4 backdrop-blur-sm">
          <div className="flex min-w-0 items-center gap-2.5">
            <UserAvatar
              name={user?.full_name ?? user?.email ?? "Admin"}
              size="sm"
              className="h-8 w-8 text-[10px]"
            />
            <p className="min-w-0 flex-1 truncate text-xs font-medium text-white/85">
              {user?.email ?? "Signed in"}
            </p>
            {openReports !== null && openReports > 0 && (
              <Link
                href="/admin/reports"
                className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold text-white transition hover:bg-white/22"
                title={`${openReports} open report${openReports === 1 ? "" : "s"}`}
              >
                <Flag className="h-3 w-3" aria-hidden />
                {openReports}
              </Link>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
