import apiClient from "@/lib/api-client";
import type { Category } from "@/types/job";
import type { User } from "@/types/user";

export interface Report {
  id: number;
  reporter_id: number;
  contract_id?: number | null;
  reason: string;
  status: string;
  created_at: string;
}

export async function getReports(): Promise<Report[]> {
  const { data } = await apiClient.get<{ reports: Report[] }>("/api/reports");
  return data.reports;
}

export async function updateReport(id: number, payload: { status: string }) {
  const { data } = await apiClient.put(`/api/reports/${id}`, payload);
  return data.report;
}

export async function getUsers(): Promise<User[]> {
  const { data } = await apiClient.get<{ users: User[] }>("/api/users");
  return data.users;
}

export async function createCategory(payload: { name: string }): Promise<Category> {
  const { data } = await apiClient.post<{ category: Category }>("/api/categories", payload);
  return data.category;
}

export async function seedCategoryPricing(
  categoryId: number,
  payload: { location: string; average_price: number; sample_size?: number }
) {
  const { data } = await apiClient.post(`/api/categories/${categoryId}/seed-pricing`, payload);
  return data;
}
