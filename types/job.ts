export type ScopeFieldType = "number" | "select" | "multiselect" | "text";

export interface ScopeFieldDefinition {
  key: string;
  label: string;
  type: ScopeFieldType;
  required?: boolean;
  unit?: string;
  options?: string[];
  /** When true (number fields only), value ÷ unit_size scales Suggested Price. */
  affects_price?: boolean;
  /** Divisor for price scaling (e.g. 100 for "per 100 words"). Default 1. */
  unit_size?: number;
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
  /** Alias of scope_schema from the API. */
  scope_fields?: ScopeFieldDefinition[] | null;
  status?: "pending" | "approved" | "rejected";
  requested_by_id?: number | null;
  request_description?: string | null;
  rejection_reason?: string | null;
  requested_by?: { id: number; full_name: string; email?: string } | null;
  baseline_price?: number | null;
  baseline_scope_key?: string | null;
  /** Derived: flat | scaled from affects_price scope fields. */
  pricing_unit?: "flat" | "scaled" | null;
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
  /** Count of CommunityApplication rows for this job (bids / applicants). */
  application_count?: number;
  created_at: string;
  category?: Category;
}

export interface CommunityApplication {
  id: number;
  job_id: number;
  community_id: number;
  status: "applied" | "approved" | "rejected";
  source?: "applied" | "invited";
  proposed_cost: number;
  proposed_days: number;
  note?: string | null;
  applied_at: string;
  community?: import("./community").Community;
  job?: Job;
}
