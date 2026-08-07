import apiClient from "@/lib/api-client";
import type { User } from "@/types/user";
import type { UserSkill } from "@/types/skill";

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

export async function getMySkills(): Promise<UserSkill[]> {
  const { data } = await apiClient.get<{ user_skills: UserSkill[] }>("/api/users/me/skills");
  return data.user_skills;
}

export async function addMySkill(payload: { skill_id: number; level: string }): Promise<UserSkill> {
  const { data } = await apiClient.post<{ user_skill: UserSkill }>("/api/users/me/skills", payload);
  return data.user_skill;
}

export async function updateMySkill(userSkillId: number, level: string): Promise<UserSkill> {
  const { data } = await apiClient.put<{ user_skill: UserSkill }>(`/api/users/me/skills/${userSkillId}`, { level });
  return data.user_skill;
}

export async function deleteMySkill(userSkillId: number): Promise<void> {
  await apiClient.delete(`/api/users/me/skills/${userSkillId}`);
}
