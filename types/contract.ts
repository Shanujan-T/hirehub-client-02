import type { Community } from "./community";
import type { Job } from "./job";
import type { User } from "./user";

export interface Contract {
  id: number;
  job_id: number;
  community_id: number;
  assigned_member_id?: number | null;
  total_amount: number;
  commission_percent: number;
  commission_amount?: number | null;
  member_payout?: number | null;
  status:
    | "pending_assignment"
    | "open_internally"
    | "active"
    | "submitted"
    | "completed"
    | "disputed";
  deliverable_url?: string | null;
  risk_level?: "none" | "low" | "high";
  risk_reason?: string | null;
  risk_flags?: string[];
  risk_checked_at?: string | null;
  created_at: string;
  job?: Job;
  community?: Community;
  assigned_member?: User;
}

export interface ContractApplication {
  id: number;
  contract_id: number;
  member_id: number;
  note?: string | null;
  status: "applied" | "selected" | "rejected";
  applied_at: string;
  member?: User;
}

export interface Payment {
  id: number;
  contract_id: number;
  total_amount: number;
  commission_amount: number;
  commission_recipient: "admin" | "community_pool" | "platform";
  member_payout: number;
  status: "pending" | "released";
  released_at?: string | null;
}

export interface Review {
  id: number;
  contract_id: number;
  reviewer_id: number;
  community_id: number;
  member_id?: number | null;
  rating: number;
  comment?: string | null;
  created_at: string;
}
