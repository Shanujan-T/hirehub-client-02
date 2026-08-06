import apiClient from "@/lib/api-client";
import type { ContractMessagesResponse, Message } from "@/types/message";

export async function getContractMessages(contractId: number): Promise<ContractMessagesResponse> {
  const { data } = await apiClient.get<ContractMessagesResponse>(
    `/api/contracts/${contractId}/messages`
  );
  return data;
}

export async function sendContractMessage(contractId: number, content: string): Promise<Message> {
  const { data } = await apiClient.post<{ message: Message }>(
    `/api/contracts/${contractId}/messages`,
    { content }
  );
  return data.message;
}

export async function suggestContractReply(
  contractId: number
): Promise<{ suggestion: string | null; available?: boolean }> {
  try {
    const { data } = await apiClient.post<{ suggestion: string | null; available?: boolean }>(
      `/api/contracts/${contractId}/messages/suggest-reply`
    );
    return data;
  } catch {
    return { suggestion: null, available: false };
  }
}

export async function deleteMessageForMe(messageId: number): Promise<void> {
  await apiClient.delete(`/api/messages/${messageId}/delete-for-me`);
}

export async function deleteMessageForEveryone(messageId: number): Promise<Message> {
  const { data } = await apiClient.delete<{ message: Message }>(
    `/api/messages/${messageId}/delete-for-everyone`
  );
  return data.message;
}
