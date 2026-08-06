import apiClient from "@/lib/api-client";

export type ConciergeResponse = {
  answer: string | null;
  intent?: string | null;
  available: boolean;
  configured: boolean;
  message?: string | null;
  suggested_prompts?: string[];
  assistive?: boolean;
};

export async function getConciergeStatus(): Promise<ConciergeResponse> {
  const { data } = await apiClient.get<ConciergeResponse>("/api/ai/concierge");
  return data;
}

export async function askConcierge(question: string): Promise<ConciergeResponse> {
  const { data } = await apiClient.post<ConciergeResponse>("/api/ai/concierge", { question });
  return data;
}
