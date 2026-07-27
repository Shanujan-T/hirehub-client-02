import type { User } from "./user";

export interface Community {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  reputation_score: number;
  created_at: string;
  member_count?: number;
  members?: CommunityMember[];
}

export interface CommunityMember {
  id: number;
  community_id: number;
  user_id: number;
  role: "admin" | "member";
  status: "pending" | "approved" | "rejected";
  joined_at?: string | null;
  user?: User;
}

export interface OpenCall {
  id: number;
  community_id: number;
  title: string;
  required_skills?: string | null;
  status: "open" | "closed";
  created_at: string;
}
