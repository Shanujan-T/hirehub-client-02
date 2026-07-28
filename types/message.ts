export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  read_at?: string | null;
  created_at: string;
  sender?: {
    id: number;
    full_name: string;
  };
}

export interface ContractMessagesResponse {
  conversation_id: number;
  messages: Message[];
}
