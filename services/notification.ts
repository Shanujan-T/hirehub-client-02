import apiClient from "@/lib/api-client";
import type { Notification } from "@/types/notification";

export async function getNotifications(unreadOnly = false): Promise<{
  notifications: Notification[];
  unread_count: number;
}> {
  const { data } = await apiClient.get<{ notifications: Notification[]; unread_count: number }>(
    "/api/notifications",
    { params: unreadOnly ? { unread: "1" } : {} }
  );
  return data;
}

export async function getUnreadCount(): Promise<number> {
  const { data } = await apiClient.get<{ unread_count: number }>("/api/notifications/unread-count");
  return data.unread_count;
}

export async function markNotificationRead(id: number): Promise<Notification> {
  const { data } = await apiClient.put<{ notification: Notification }>(
    `/api/notifications/${id}/read`
  );
  return data.notification;
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiClient.put("/api/notifications/read-all");
}
