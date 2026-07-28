import apiClient from "@/lib/api-client";
import type { Community, CommunityMember, OpenCall } from "@/types/community";

export async function getCommunities(): Promise<Community[]> {
  const { data } = await apiClient.get<{ communities: Community[] }>("/api/communities");
  return data.communities;
}

export async function getCommunity(id: number): Promise<Community> {
  const { data } = await apiClient.get<{ community: Community }>(`/api/communities/${id}`);
  return data.community;
}

export async function createCommunity(payload: {
  name: string;
  description?: string;
  location?: string;
}): Promise<Community> {
  const { data } = await apiClient.post<{ community: Community }>("/api/communities", payload);
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

export async function getOpenCalls(communityId?: number): Promise<OpenCall[]> {
  const { data } = await apiClient.get<{ open_calls: OpenCall[] }>("/api/open-calls", {
    params: communityId ? { community_id: communityId } : {},
  });
  return data.open_calls;
}

export async function createOpenCall(payload: {
  community_id: number;
  title: string;
  skill_ids?: number[];
}): Promise<OpenCall> {
  const { data } = await apiClient.post<{ open_call: OpenCall }>("/api/open-calls", payload);
  return data.open_call;
}

export async function getSkills() {
  const { data } = await apiClient.get<{ skills: { id: number; name: string; category?: string }[] }>(
    "/api/skills"
  );
  return data.skills;
}
