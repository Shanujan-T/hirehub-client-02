import type { Category } from "./job";
import type { Skill } from "./job";
import type { User } from "./user";

export type CommunityStatus = "pending" | "approved" | "rejected";
export type ExperienceLevel = "less_than_1_year" | "1_to_3_years" | "3_plus_years";

export interface Community {
  id: number;
  name: string;
  description?: string | null;
  location?: string | null;
  image_url?: string | null;
  category_id: number;
  experience_level: ExperienceLevel;
  specialization?: string | null;
  portfolio_links?: string[];
  admin_bio?: string | null;
  contact_phone?: string | null;
  status: CommunityStatus;
  rejection_reason?: string | null;
  reputation_score: number;
  created_at: string;
  member_count?: number;
  members?: CommunityMember[];
  category?: Category;
  admin_user?: User;
}

export interface CommunityMember {
  id: number;
  community_id: number;
  user_id: number;
  role: "admin" | "member";
  status: "pending" | "approved" | "rejected";
  joined_at?: string | null;
  user?: User;
  community?: Pick<
    Community,
    | "id"
    | "name"
    | "status"
    | "rejection_reason"
    | "category"
    | "experience_level"
    | "location"
    | "image_url"
  >;
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
