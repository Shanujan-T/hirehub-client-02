export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string | null;
  read_at?: string | null;
  created_at: string;
  sender?: {
    id: number;
    full_name: string;
  };
  deleted_for_everyone?: boolean;
  deleted_for_sender?: boolean;
  deleted_for_receiver?: boolean;
  deleted_at?: string | null;
  is_deleted?: boolean;
  message_type?: "text" | "deleted";
}

export interface ContractMessagesResponse {
  conversation_id: number;
  messages: Message[];
}

export function isMessageVisible(message: Message, userId: number | undefined): boolean {
  if (!userId) return true;
  if (message.is_deleted || message.deleted_for_everyone) return true;
  if (message.sender_id === userId && message.deleted_for_sender) return false;
  if (message.sender_id !== userId && message.deleted_for_receiver) return false;
  return true;
}
