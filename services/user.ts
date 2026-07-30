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

type OtpSendResponse = { message: string; dev_code?: string };

export async function sendIdentityPhoneOtp(phone_number: string): Promise<OtpSendResponse> {
  const { data } = await apiClient.post<OtpSendResponse>(
    "/api/users/me/identity-verification/phone/send",
    { phone_number }
  );
  return data;
}

export async function confirmIdentityPhoneOtp(code: string): Promise<User> {
  const { data } = await apiClient.post<{ user: User }>(
    "/api/users/me/identity-verification/phone/confirm",
    { code }
  );
  return data.user;
}

export async function sendIdentityEmailOtp(): Promise<OtpSendResponse> {
  const { data } = await apiClient.post<OtpSendResponse>(
    "/api/users/me/identity-verification/email/send"
  );
  return data;
}

export async function confirmIdentityEmailOtp(code: string): Promise<User> {
  const { data } = await apiClient.post<{ user: User }>(
    "/api/users/me/identity-verification/email/confirm",
    { code }
  );
  return data.user;
}
