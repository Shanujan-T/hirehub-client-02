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
