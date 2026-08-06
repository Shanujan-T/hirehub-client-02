export interface Skill {
  id: number;
  name: string;
  category?: string | null;
  created_at: string;
}

export interface WorkSample {
  id: number;
  user_skill_id: number;
  sample_type: "text" | "image";
  content: string;
  ai_assessment?: string | null;
  verification_status: "unreviewed" | "plausible" | "unclear";
  created_at: string;
}

export interface UserSkill {
  id: number;
  user_id: number;
  skill_id: number;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  skill?: Skill;
  ai_reviewed?: boolean;
  work_samples?: WorkSample[];
}
