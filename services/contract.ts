import apiClient from "@/lib/api-client";
import type {
  Contract,
  ContractApplication,
  Payment,
  Review,
} from "@/types/contract";

export async function getContracts(): Promise<Contract[]> {
  const { data } = await apiClient.get<{ contracts: Contract[] }>("/api/contracts");
  return data.contracts;
}

export async function getContractsNeedingAttention(): Promise<{
  contracts: Contract[];
  count: number;
}> {
  const { data } = await apiClient.get<{ contracts: Contract[]; count: number }>(
    "/api/contracts/needs-attention"
  );
  return data;
}

export async function getContract(id: number): Promise<Contract> {
  const { data } = await apiClient.get<{ contract: Contract }>(`/api/contracts/${id}`);
  return data.contract;
}

export async function openContractInternally(contractId: number): Promise<Contract> {
  const { data } = await apiClient.post<{ contract: Contract }>(
    `/api/contracts/${contractId}/open-internally`
  );
  return data.contract;
}

export async function applyToContract(
  contractId: number,
  note?: string
): Promise<ContractApplication> {
  const { data } = await apiClient.post<{ contract_application: ContractApplication }>(
    "/api/contract-applications/apply",
    { contract_id: contractId, note }
  );
  return data.contract_application;
}

export async function getContractApplicants(contractId: number): Promise<ContractApplication[]> {
  const { data } = await apiClient.get<{ contract_applications: ContractApplication[] }>(
    `/api/contract-applications/contract/${contractId}`
  );
  return data.contract_applications;
}

export async function selectMember(
  contractId: number,
  applicationId: number
): Promise<Contract> {
  const { data } = await apiClient.post<{ contract: Contract }>(
    `/api/contracts/${contractId}/select-member`,
    { application_id: applicationId }
  );
  return data.contract;
}

export async function submitDeliverable(
  contractId: number,
  deliverableUrl: string
): Promise<Contract> {
  const { data } = await apiClient.post<{ contract: Contract }>(
    `/api/contracts/${contractId}/submit-deliverable`,
    { deliverable_url: deliverableUrl }
  );
  return data.contract;
}

export async function adminApproveDeliverable(contractId: number): Promise<Contract> {
  const { data } = await apiClient.post<{ contract: Contract }>(
    `/api/contracts/${contractId}/admin-approve-deliverable`
  );
  return data.contract;
}

export async function aiReviewDeliverable(contractId: number): Promise<string | null> {
  try {
    const { data } = await apiClient.post<{ review?: string | null }>(
      `/api/contracts/${contractId}/ai-review-deliverable`
    );
    return data.review?.trim() || null;
  } catch {
    return null;
  }
}

export async function posterApproveDeliverable(contractId: number) {
  const { data } = await apiClient.post(
    `/api/contracts/${contractId}/poster-approve-deliverable`
  );
  return data;
}

/** @deprecated use posterApproveDeliverable */
export async function clientApproveDeliverable(contractId: number) {
  return posterApproveDeliverable(contractId);
}

export async function getMyEarnings(): Promise<Payment[]> {
  const { data } = await apiClient.get<{ payments: Payment[] }>("/api/payments/my-earnings");
  return data.payments;
}

export async function getPayments(): Promise<Payment[]> {
  const { data } = await apiClient.get<{ payments: Payment[] }>("/api/payments");
  return data.payments;
}

export async function getMyContractApplications(): Promise<ContractApplication[]> {
  const { data } = await apiClient.get<{ contract_applications: ContractApplication[] }>(
    "/api/contract-applications/my"
  );
  return data.contract_applications;
}

export async function createReview(payload: {
  contract_id: number;
  community_id: number;
  member_id?: number;
  rating: number;
  comment?: string;
}): Promise<Review> {
  const { data } = await apiClient.post<{ review: Review }>("/api/reviews", payload);
  return data.review;
}

export async function getSkills() {
  const { data } = await apiClient.get("/api/skills");
  return data.skills;
}

export async function createUserSkill(payload: {
  user_id: number;
  skill_id: number;
  level: string;
}) {
  const { data } = await apiClient.post("/api/user-skills", payload);
  return data.user_skill;
}

export async function getUserSkills(userId?: number) {
  const { data } = await apiClient.get("/api/user-skills", {
    params: userId ? { user_id: userId } : {},
  });
  return data.user_skills;
}

export async function createWorkSample(
  userSkillId: number,
  payload: { sample_type: "text" | "image"; content: string }
) {
  const { data } = await apiClient.post(`/api/user-skills/${userSkillId}/work-samples`, payload);
  return data as {
    work_sample: import("@/types/skill").WorkSample;
    user_skill: import("@/types/skill").UserSkill;
    vision_available?: boolean | null;
    message?: string | null;
  };
}

export async function uploadWorkSampleImage(userSkillId: number, file: File) {
  const form = new FormData();
  form.append("sample_type", "image");
  form.append("file", file);
  const { data } = await apiClient.post(`/api/user-skills/${userSkillId}/work-samples`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as {
    work_sample: import("@/types/skill").WorkSample;
    user_skill: import("@/types/skill").UserSkill;
    vision_available?: boolean | null;
    message?: string | null;
  };
}

export async function verifyWorkSample(sampleId: number) {
  const { data } = await apiClient.post(`/api/work-samples/${sampleId}/verify`);
  return data as {
    work_sample: import("@/types/skill").WorkSample;
    user_skill: import("@/types/skill").UserSkill;
    available?: boolean;
    vision_available?: boolean | null;
    message?: string | null;
  };
}

export async function getUserSkillWithSamples(userSkillId: number) {
  const { data } = await apiClient.get(`/api/user-skills/${userSkillId}/work-samples`);
  return data.user_skill as import("@/types/skill").UserSkill;
}

import type { UserAddress } from "@/types/user";

export async function updateUser(
  userId: number,
  payload: {
    full_name?: string;
    bio?: string;
    location?: string | null;
    avatar_url?: string | null;
  } & Partial<UserAddress>
) {
  const { data } = await apiClient.put(`/api/users/${userId}`, payload);
  return data.user;
}
