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
  reporter?: { id: number; full_name: string; email?: string };
  contract?: {
    id: number;
    status: string;
    deliverable_url?: string | null;
    job?: { id: number; title: string } | null;
    community?: { id: number; name: string } | null;
  } | null;
}

export async function getReports(): Promise<Report[]> {
  const { data } = await apiClient.get<{ reports: Report[] }>("/api/reports");
  return data.reports;
}

export async function getReport(id: number): Promise<Report> {
  const { data } = await apiClient.get<{ report: Report }>(`/api/reports/${id}`);
  return data.report;
}

export async function getReportAiSummary(id: number): Promise<{
  summary: string;
  suggested_direction?: string | null;
  assistive?: boolean;
}> {
  const { data } = await apiClient.get<{
    summary: string;
    suggested_direction?: string | null;
    assistive?: boolean;
  }>(`/api/reports/${id}/ai-summary`);
  return data;
}

export async function updateReport(id: number, payload: { status: string }) {
  const { data } = await apiClient.put(`/api/reports/${id}`, payload);
  return data.report;
}

export async function getUsers(): Promise<User[]> {
  const { data } = await apiClient.get<{ users: User[] }>("/api/users");
  return data.users;
}

export async function getUser(id: number): Promise<User> {
  const { data } = await apiClient.get<{ user: User }>(`/api/users/${id}`);
  return data.user;
}

export async function adminSetUserActive(id: number, is_active: boolean): Promise<User> {
  const { data } = await apiClient.put<{ user: User }>(`/api/users/${id}`, { is_active });
  return data.user;
}

export async function createCategory(payload: {
  name: string;
  scope_schema?: import("@/types/job").ScopeFieldDefinition[] | null;
  baseline_price?: number | null;
  baseline_unit?: "per_job" | "per_sqft" | "per_word" | "per_hour" | null;
}): Promise<Category> {
  const { data } = await apiClient.post<{ category: Category }>("/api/categories", payload);
  return data.category;
}

export async function updateCategory(
  categoryId: number,
  payload: {
    name?: string;
    scope_schema?: import("@/types/job").ScopeFieldDefinition[] | null;
    baseline_price?: number | null;
    baseline_unit?: "per_job" | "per_sqft" | "per_word" | "per_hour" | null;
  }
): Promise<Category> {
  const { data } = await apiClient.put<{ category: Category }>(
    `/api/categories/${categoryId}`,
    payload
  );
  return data.category;
}

export async function approveCategory(
  categoryId: number,
  payload?: { scope_schema?: import("@/types/job").ScopeFieldDefinition[] | null }
): Promise<Category> {
  const { data } = await apiClient.post<{ category: Category }>(
    `/api/categories/${categoryId}/approve`,
    payload || {}
  );
  return data.category;
}

export async function rejectCategory(
  categoryId: number,
  payload?: { reason?: string }
): Promise<Category> {
  const { data } = await apiClient.post<{ category: Category }>(
    `/api/categories/${categoryId}/reject`,
    payload || {}
  );
  return data.category;
}

export async function seedCategoryPricing(
  categoryId: number,
  payload: { location: string; average_price: number; sample_size?: number; force?: boolean }
) {
  const { data } = await apiClient.post(`/api/categories/${categoryId}/seed-pricing`, payload);
  return data;
}

export async function seedDistrictPricing(categoryId?: number): Promise<{
  message: string;
  stats?: { created: number; updated: number; skipped: number };
}> {
  if (categoryId != null) {
    const { data } = await apiClient.post<{
      message: string;
      stats?: { created: number; updated: number; skipped: number };
    }>(`/api/categories/${categoryId}/seed-district-pricing`);
    return data;
  }
  const { data } = await apiClient.post<{
    message: string;
    stats?: { created: number; updated: number; skipped: number };
  }>("/api/categories/seed-district-pricing");
  return data;
}

export interface PublicStats {
  communities: number;
  jobs: number;
  contracts_completed: number;
}

export async function getPublicStats(): Promise<PublicStats> {
  const { data } = await apiClient.get<{ stats: PublicStats }>("/api/stats");
  return data.stats;
}
