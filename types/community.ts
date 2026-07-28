import type { Skill } from "./job";
import type { User } from "./user";

export interface Community {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  image_url?: string | null;
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

export interface OpenCallSkill {
  id: number;
  open_call_id: number;
  skill_id: number;
  skill?: Skill | null;
}

export interface OpenCall {
  id: number;
  community_id: number;
  title: string;
  status: "open" | "closed";
  created_at: string;
  skills?: OpenCallSkill[];
}
