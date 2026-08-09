"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { createSocket } from "@/lib/socket";
import { notify } from "@/lib/notify";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notification";
import { useAuth } from "@/providers/auth-provider";
import type { Notification } from "@/types/notification";
import type { Socket } from "socket.io-client";

const POLL_MS = 30_000;

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  markAllRead: () => Promise<void>;
  openNotification: (notification: Notification) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

function showNotificationToast(notification: Notification, onOpen: () => void) {
  notify.info(notification.title, {
    description: notification.body,
    action: notification.link_href
      ? { label: "View", onClick: onOpen }
      : undefined,
  });
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const knownIdsRef = useRef<Set<number>>(new Set());

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
      knownIdsRef.current = new Set(data.notifications.map((n) => n.id));
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markRead = useCallback(async (id: number) => {
    try {
      const updated = await markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? updated : n)));
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch (err) {
      console.error("Failed to mark notification read", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all notifications read", err);
    }
  }, []);

  const openNotification = useCallback(
    async (notification: Notification) => {
      if (!notification.read_at) {
        await markRead(notification.id);
      }
      if (notification.link_href) {
        router.push(notification.link_href);
      }
    },
    [markRead, router]
  );

  useEffect(() => {
    if (!user || !token) {
      setNotifications([]);
      setUnreadCount(0);
      knownIdsRef.current.clear();
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    void refresh();

    const poll = window.setInterval(() => {
      void refresh().catch((err) => console.error("Notification poll failed", err));
    }, POLL_MS);

    const socket = createSocket(token);
    socketRef.current = socket;

    const handleNotification = (payload: Notification) => {
      setNotifications((prev) => {
        if (prev.some((n) => n.id === payload.id)) return prev;
        return [payload, ...prev].slice(0, 50);
      });
      if (!payload.read_at) {
        setUnreadCount((count) => count + 1);
      }
      if (!knownIdsRef.current.has(payload.id)) {
        knownIdsRef.current.add(payload.id);
        showNotificationToast(payload, () => {
          void openNotification(payload);
        });
      }
    };

    socket.on("notification", handleNotification);
    socket.on("connect_error", (err) => {
      console.error("Notification socket connect_error", err.message);
    });
    const connectTimer = window.setTimeout(() => socket.connect(), 0);

    return () => {
      window.clearTimeout(connectTimer);
      window.clearInterval(poll);
      socket.off("notification", handleNotification);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, token, refresh, openNotification]);

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      loading,
      refresh,
      markRead,
      markAllRead,
      openNotification,
    }),
    [notifications, unreadCount, loading, refresh, markRead, markAllRead, openNotification]
  );

  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
