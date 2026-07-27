export interface Skill {
  id: number;
  name: string;
  category?: string | null;
  created_at: string;
}

export interface UserSkill {
  id: number;
  user_id: number;
  skill_id: number;
  level: "beginner" | "intermediate" | "advanced" | "expert";
  skill?: Skill;
}
