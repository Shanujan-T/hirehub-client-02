import type { CommunityMember } from "@/types/community";
import type { UserSkill } from "./skill";

export type UserRole = "admin" | "user";

/** Private postal address — only returned for the account owner (and admins). */
export interface UserAddress {
  address_line1?: string | null;
  address_line2?: string | null;
  address_city?: string | null;
  address_region?: string | null;
  address_postal_code?: string | null;
}

/** NIC document review status — gates community creation when verified. */
export type IdentityStatus = "unverified" | "pending" | "verified" | "rejected";

export interface User extends UserAddress {
  id: number;
  email: string;
  role: UserRole;
  full_name: string;
  bio?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  identity_status: IdentityStatus;
  identity_rejection_reason?: string | null;
  phone_number?: string | null;
  email_verified_for_identity?: boolean;
  phone_verified_for_identity?: boolean;
  /** @deprecated legacy NIC manual review */
  nic_masked?: string | null;
  /** @deprecated legacy NIC manual review */
  nic_document_url?: string | null;
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
}

export interface LoginPayload {
  email: string;
  password: string;
}
