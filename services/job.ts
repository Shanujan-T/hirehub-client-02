import apiClient from "@/lib/api-client";
import type { Category, CommunityApplication, Job } from "@/types/job";

export interface PricingSuggestion {
  average_price: number | null;
  sample_size: number;
}

export async function getJobs(): Promise<Job[]> {
  const { data } = await apiClient.get<{ jobs: Job[] }>("/api/jobs");
  return data.jobs;
}

export async function getJob(id: number): Promise<Job> {
  const { data } = await apiClient.get<{ job: Job }>(`/api/jobs/${id}`);
  return data.job;
}

export async function createJob(payload: {
  category_id: number;
  title: string;
  description: string;
  location: string;
  deadline: string;
  final_price: number;
}): Promise<Job> {
  const { data } = await apiClient.post<{ job: Job }>("/api/jobs", payload);
  return data.job;
}

export async function getCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<{ categories: Category[] }>("/api/categories");
  return data.categories;
}

export async function getPricingSuggestion(
  categoryId: number,
  location: string
): Promise<PricingSuggestion> {
  const { data } = await apiClient.get<PricingSuggestion>(
    `/api/categories/${categoryId}/pricing-suggestion`,
    { params: { location } }
  );
  return data;
}

export async function applyToJob(jobId: number, communityId: number): Promise<CommunityApplication> {
  const { data } = await apiClient.post<{ community_application: CommunityApplication }>(
    "/api/community-applications/apply",
    { job_id: jobId, community_id: communityId }
  );
  return data.community_application;
}

export async function getJobApplicants(jobId: number): Promise<CommunityApplication[]> {
  const { data } = await apiClient.get<{ community_applications: CommunityApplication[] }>(
    `/api/community-applications/job/${jobId}`
  );
  return data.community_applications;
}

export async function approveCommunity(applicationId: number, commissionPercent = 3) {
  const { data } = await apiClient.post(
    `/api/community-applications/${applicationId}/approve`,
    { commission_percent: commissionPercent }
  );
  return data;
}

export async function rejectCommunity(applicationId: number) {
  const { data } = await apiClient.post(`/api/community-applications/${applicationId}/reject`);
  return data;
}

export async function getMyJobApplications(): Promise<CommunityApplication[]> {
  const { data } = await apiClient.get<{ community_applications: CommunityApplication[] }>(
    "/api/community-applications/my"
  );
  return data.community_applications;
}
