import type { CommunityMember } from "@/types/community";
import type { UserSkill } from "./skill";

export type UserRole = "admin" | "client" | "user";

export interface User {
  id: number;
  email: string;
  role: UserRole;
  full_name: string;
  bio?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  is_active: boolean;
  created_at: string;
  completed_project_count?: number;
  rating?: number;
  user_skills?: UserSkill[];
  community_memberships?: (CommunityMember & {
    community?: { id: number; name: string };
  })[];
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface RegisterPayload {
  email: string;
  password: string;
  full_name: string;
  role?: "user" | "client";
}

export interface LoginPayload {
  email: string;
  password: string;
}
