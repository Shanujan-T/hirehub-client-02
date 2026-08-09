"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Sparkles } from "lucide-react";
import { useNotifications } from "@/providers/notification-provider";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types/notification";
import { getDashboardPath, useAuth } from "@/providers/auth-provider";

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function NotificationItem({
  notification,
  onOpen,
}: {
  notification: Notification;
  onOpen: (notification: Notification) => void;
}) {
  const unread = !notification.read_at && notification.is_read !== true;
  const isWeeklyDigest = notification.type === "weekly_digest";
  const content = (
    <>
      <div className="flex items-start gap-2">
        {isWeeklyDigest ? (
          <Sparkles
            className="mt-0.5 h-4 w-4 shrink-0 text-secondary"
            aria-hidden
          />
        ) : unread ? (
          <span
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-info"
            aria-hidden
          />
        ) : (
          <span className="mt-1.5 h-2 w-2 shrink-0" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <p className={cn("text-sm", unread ? "font-semibold text-foreground" : "text-foreground")}>
            {notification.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted">{notification.body}</p>
          <p className="mt-1 text-[10px] text-muted">{formatRelativeTime(notification.created_at)}</p>
        </div>
      </div>
    </>
  );

  return (
    <button
      type="button"
      className={cn(
        "block w-full border-b border-border px-4 py-3 text-left transition hover:bg-border/30",
        unread && "bg-info/5"
      )}
      onClick={() => onOpen(notification)}
    >
      {content}
    </button>
  );
}

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, loading, refresh, markAllRead, openNotification } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    if (next) void refresh();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={open}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-muted transition hover:bg-border/50 hover:text-info"
        onClick={toggle}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-border bg-card shadow-lg shadow-black/10">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-semibold text-foreground">Notifications</p>
            {unreadCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={() => void markAllRead()}
              >
                Mark all read
              </Button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">Loading…</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">No notifications yet.</p>
            ) : (
              notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onOpen={(item) => {
                    setOpen(false);
                    void openNotification(item);
                  }}
                />
              ))
            )}
          </div>

          <div className="border-t border-border px-4 py-2 text-center">
            <Link
              href={getDashboardPath(user)}
              className="text-xs text-info hover:underline"
              onClick={() => setOpen(false)}
            >
              Open dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
