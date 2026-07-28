import apiClient from "@/lib/api-client";
import type { User } from "@/types/user";

export async function uploadUserAvatar(userId: number, file: File): Promise<User> {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await apiClient.post<{ user: User }>(`/api/users/${userId}/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.user;
}
