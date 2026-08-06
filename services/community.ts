import apiClient from "@/lib/api-client";
import type { Community, CommunityMember, OpenCall } from "@/types/community";

export async function getCommunities(options?: { status?: string }): Promise<Community[]> {
  const { data } = await apiClient.get<{ communities: Community[] }>("/api/communities", {
    params: options?.status ? { status: options.status } : {},
  });
  return data.communities;
}

export async function getCommunity(id: number): Promise<Community> {
  const { data } = await apiClient.get<{ community: Community }>(`/api/communities/${id}`);
  return data.community;
}

export type JobMatchRecommendation = {
  job: import("@/types/job").Job;
  match_score: number;
  skill_score: number;
  location_match: boolean;
  category_match: boolean;
  skill_summary: string;
  ai_blurb: string | null;
  ai_available: boolean;
};

export async function getRecommendedJobs(communityId: number): Promise<JobMatchRecommendation[]> {
  const { data } = await apiClient.get<{ recommendations: JobMatchRecommendation[] }>(
    `/api/communities/${communityId}/recommended-jobs`
  );
  return data.recommendations ?? [];
}

export type FitAnalysis = {
  fit_summary: string;
  overlap_skills: string[];
  new_skills_added: string[];
};

export async function analyzeJoinRequestFit(
  communityId: number,
  userId: number
): Promise<{ available: boolean; analysis: FitAnalysis | null; error?: string }> {
  try {
    const { data } = await apiClient.post<{
      available: boolean;
      analysis?: FitAnalysis | null;
      error?: string;
      message?: string;
    }>(`/api/communities/${communityId}/join-requests/${userId}/fit-analysis`);
    return {
      available: Boolean(data.available && data.analysis),
      analysis: data.analysis ?? null,
      error: data.error || data.message,
    };
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "response" in err
        ? String(
            (err as { response?: { data?: { error?: string; message?: string } } }).response?.data
              ?.error ||
              (err as { response?: { data?: { message?: string } } }).response?.data?.message ||
              ""
          )
        : "";
    return {
      available: false,
      analysis: null,
      error: message || "AI suggestion unavailable.",
    };
  }
}

export async function createCommunity(payload: {
  name: string;
  description?: string;
  location?: string;
  category_id: number;
  experience_level: string;
  specialization?: string;
  portfolio_links?: string[];
  admin_bio?: string;
  contact_phone?: string;
  terms_accepted: boolean;
}): Promise<Community> {
  const { data } = await apiClient.post<{ community: Community }>("/api/communities", payload);
  return data.community;
}

export async function verifyCommunity(
  communityId: number,
  payload: { verification_status: "verified" | "rejected"; reason?: string }
): Promise<Community> {
  const { data } = await apiClient.patch<{ community: Community }>(
    `/api/communities/${communityId}/verify`,
    payload
  );
  return data.community;
}

/** @deprecated Use verifyCommunity instead */
export async function reviewCommunity(
  communityId: number,
  payload: { approve: boolean; reason?: string }
): Promise<Community> {
  const { data } = await apiClient.put<{ community: Community }>(
    `/api/communities/${communityId}/review`,
    payload
  );
  return data.community;
}

export async function updateCommunity(
  communityId: number,
  payload: {
    name: string;
    description?: string | null;
    location: string;
  }
): Promise<Community> {
  const { data } = await apiClient.patch<{ community: Community }>(
    `/api/communities/${communityId}`,
    payload
  );
  return data.community;
}

export async function uploadCommunityImage(communityId: number, file: File): Promise<Community> {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await apiClient.post<{ community: Community }>(
    `/api/communities/${communityId}/image`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
  return data.community;
}

export async function getMyMemberships(): Promise<CommunityMember[]> {
  const { data } = await apiClient.get<{ community_members: CommunityMember[] }>(
    "/api/community-members/my"
  );
  return data.community_members;
}

export async function joinCommunity(communityId: number): Promise<CommunityMember> {
  const { data } = await apiClient.post<{ community_member: CommunityMember }>(
    `/api/community-members/join/${communityId}`
  );
  return data.community_member;
}

export async function approveMember(membershipId: number): Promise<CommunityMember> {
  const { data } = await apiClient.post<{ community_member: CommunityMember }>(
    `/api/community-members/${membershipId}/approve`
  );
  return data.community_member;
}

export async function rejectMember(membershipId: number): Promise<CommunityMember> {
  const { data } = await apiClient.post<{ community_member: CommunityMember }>(
    `/api/community-members/${membershipId}/reject`
  );
  return data.community_member;
}

export async function getCommunityMembers(
  communityId: number,
  status?: string
): Promise<CommunityMember[]> {
  const { data } = await apiClient.get<{ community_members: CommunityMember[] }>(
    `/api/community-members/community/${communityId}`,
    { params: status ? { status } : {} }
  );
  return data.community_members;
}

export async function removeCommunityMember(membershipId: number): Promise<void> {
  await apiClient.delete(`/api/community-members/${membershipId}`);
}

/** Matches API MIN_COMMUNITY_MEMBERS — used for listing eligibility warnings. */
export const MIN_COMMUNITY_MEMBERS = 3;

export async function getOpenCalls(communityId?: number): Promise<OpenCall[]> {
  const { data } = await apiClient.get<{ open_calls: OpenCall[] }>("/api/open-calls", {
    params: communityId ? { community_id: communityId } : {},
  });
  return data.open_calls;
}

export async function createOpenCall(payload: {
  community_id: number;
  title: string;
  description?: string;
  skill_ids?: number[];
}): Promise<OpenCall> {
  const { data } = await apiClient.post<{ open_call: OpenCall }>("/api/open-calls", payload);
  return data.open_call;
}

export async function generateOpenCallDescription(payload: {
  title?: string;
  prompt?: string;
  required_skills?: string[];
}): Promise<{ description: string } | null> {
  try {
    const { data } = await apiClient.post<{
      suggestion?: { description?: string } | null;
    }>("/api/open-calls/generate-description", payload);
    const description = data.suggestion?.description?.trim();
    return description ? { description } : null;
  } catch {
    return null;
  }
}

export async function getCommunityReviewDigest(communityId: number): Promise<{
  available: boolean;
  praised: string[];
  flagged: string[];
  review_count?: number;
  reason?: string;
} | null> {
  try {
    const { data } = await apiClient.get<{
      digest: {
        available: boolean;
        praised: string[];
        flagged: string[];
        review_count?: number;
        reason?: string;
      };
    }>(`/api/communities/${communityId}/review-digest`);
    return data.digest;
  } catch {
    return null;
  }
}

export async function getSkills() {
  const { data } = await apiClient.get<{ skills: { id: number; name: string; category?: string }[] }>(
    "/api/skills"
  );
  return data.skills;
}
