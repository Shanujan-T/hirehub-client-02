export type ScopeFieldType = "number" | "select" | "multiselect";

export interface ScopeFieldDefinition {
  key: string;
  label: string;
  type: ScopeFieldType;
  required?: boolean;
  unit?: string;
  options?: string[];
}

export type ScopeData = Record<string, number | string | string[]>;

export interface ScopeDisplayRow {
  key: string;
  label: string;
  value: string;
}

export interface Category {
  id: number;
  name: string;
  scope_schema?: ScopeFieldDefinition[] | null;
  status?: "pending" | "approved" | "rejected";
  requested_by_id?: number | null;
  request_description?: string | null;
  rejection_reason?: string | null;
  requested_by?: { id: number; full_name: string; email?: string } | null;
  baseline_price?: number | null;
  baseline_unit?: "per_job" | "per_sqft" | null;
  created_at: string;
}

export interface Skill {
  id: number;
  name: string;
  category?: string | null;
  created_at: string;
}

export interface CategoryPricing {
  id: number;
  category_id: number;
  location: string;
  average_price: number;
  sample_size: number;
  last_updated: string;
}

export interface Job {
  id: number;
  posted_by_id?: number;
  category_id: number;
  title: string;
  description: string;
  location: string;
  deadline: string;
  suggested_price?: number | null;
  final_price: number;
  scope_data?: ScopeData | null;
  scope_display?: ScopeDisplayRow[];
  status: "open" | "assigned" | "closed";
  created_at: string;
  category?: Category;
}

export interface CommunityApplication {
  id: number;
  job_id: number;
  community_id: number;
  status: "applied" | "approved" | "rejected";
  proposed_cost: number;
  proposed_days: number;
  note?: string | null;
  applied_at: string;
  community?: import("./community").Community;
  job?: Job;
}
