import apiClient from "@/lib/api-client";
import type { AuthResponse, LoginPayload, RegisterPayload, User } from "@/types/user";

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/auth/register", payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/api/auth/login", payload);
  return data;
}

export async function getMe(): Promise<User> {
  const { data } = await apiClient.get<{ user: User }>("/api/auth/me");
  return data.user;
}
