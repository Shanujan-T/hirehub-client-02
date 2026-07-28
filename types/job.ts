export interface Category {
  id: number;
  name: string;
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
  client_id?: number;
  category_id: number;
  title: string;
  description: string;
  location: string;
  deadline: string;
  suggested_price?: number | null;
  final_price: number;
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
