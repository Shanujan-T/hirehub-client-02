import apiClient from "@/lib/api-client";
import type { Category, CommunityApplication, Job } from "@/types/job";

export interface PricingSuggestion {
  average_price: number | null;
  suggested_price?: number | null;
  sample_size: number;
  method?:
    | "scope_adjusted"
    | "historical_average"
    | "posted_jobs_average"
    | "baseline_estimate"
    | "seeded_district_estimate"
    | "flat_average"
    | "insufficient_data"
    | string;
  note?: string | null;
  is_seeded_estimate?: boolean;
}

export async function getMyJobs(options?: {
  category_id?: number;
  status?: "open" | "assigned" | "closed";
}): Promise<Job[]> {
  const { data } = await apiClient.get<{ jobs: Job[] }>("/api/jobs", {
    params: {
      ...(options?.category_id ? { category_id: options.category_id } : {}),
      ...(options?.status ? { status: options.status } : {}),
    },
  });
  return data.jobs;
}

export async function getMarketplaceJobs(): Promise<Job[]> {
  const { data } = await apiClient.get<{ jobs: Job[] }>("/api/jobs", {
    params: { marketplace: true },
  });
  return data.jobs;
}

/** @deprecated use getMyJobs */
export async function getJobs(): Promise<Job[]> {
  return getMyJobs();
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
  suggested_price?: number | null;
  scope_data?: import("@/types/job").ScopeData | null;
}): Promise<Job> {
  const { data } = await apiClient.post<{ job: Job }>("/api/jobs", payload);
  return data.job;
}

export async function getCategories(options?: {
  status?: "approved" | "pending" | "rejected" | "all";
}): Promise<Category[]> {
  const { data } = await apiClient.get<{ categories: Category[] }>("/api/categories", {
    params: options?.status && options.status !== "approved" ? { status: options.status } : {},
  });
  return data.categories;
}

export async function requestCategory(payload: {
  name: string;
  description?: string;
}): Promise<Category> {
  const { data } = await apiClient.post<{ category: Category }>("/api/categories/request", payload);
  return data.category;
}

export async function getPricingSuggestion(
  categoryId: number,
  location: string,
  scopeValues?: import("@/types/job").ScopeData | null
): Promise<PricingSuggestion> {
  const { data } = await apiClient.get<PricingSuggestion>(
    `/api/categories/${categoryId}/pricing-suggestion`,
    {
      params: {
        location,
        ...(scopeValues && Object.keys(scopeValues).length
          ? { scope_values: JSON.stringify(scopeValues) }
          : {}),
      },
    }
  );
  return data;
}

export async function applyToJob(payload: {
  job_id: number;
  community_id: number;
  proposed_cost: number;
  proposed_days: number;
  note?: string;
}): Promise<CommunityApplication> {
  const { data } = await apiClient.post<{ community_application: CommunityApplication }>(
    "/api/community-applications/apply",
    payload
  );
  return data.community_application;
}

export async function getJobApplicants(jobId: number): Promise<CommunityApplication[]> {
  const { data } = await apiClient.get<{ community_applications: CommunityApplication[] }>(
    `/api/community-applications/job/${jobId}`
  );
  return data.community_applications;
}

export type CommunityMatchRecommendation = {
  community: import("@/types/community").Community;
  match_score: number;
  skill_score: number;
  location_match: boolean;
  category_match: boolean;
  skill_summary: string;
  ai_blurb: string | null;
  ai_available: boolean;
};

export async function getRecommendedCommunities(
  jobId: number
): Promise<CommunityMatchRecommendation[]> {
  const { data } = await apiClient.get<{ recommendations: CommunityMatchRecommendation[] }>(
    `/api/jobs/${jobId}/recommended-communities`
  );
  return data.recommendations ?? [];
}

export type BidSuggestion = {
  suggested_cost: number;
  suggested_days: number;
  reasoning: string;
};

export async function suggestBid(
  jobId: number,
  communityId: number
): Promise<BidSuggestion | null> {
  try {
    const { data } = await apiClient.post<{ suggestion?: BidSuggestion | null }>(
      `/api/jobs/${jobId}/suggest-bid`,
      { community_id: communityId }
    );
    return data.suggestion ?? null;
  } catch {
    return null;
  }
}

export type JobDescriptionSuggestion = {
  title: string;
  description: string;
  suggested_category?: string;
  category_id?: number | null;
};

export async function generateJobDescription(
  prompt: string
): Promise<JobDescriptionSuggestion | null> {
  try {
    const { data } = await apiClient.post<{ suggestion?: JobDescriptionSuggestion | null }>(
      "/api/jobs/generate-description",
      { prompt }
    );
    return data.suggestion ?? null;
  } catch {
    return null;
  }
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

export async function inviteCommunityToJob(
  jobId: number,
  communityId: number
): Promise<CommunityApplication> {
  const { data } = await apiClient.post<{ community_application: CommunityApplication }>(
    `/api/jobs/${jobId}/invite`,
    { community_id: communityId }
  );
  return data.community_application;
}
