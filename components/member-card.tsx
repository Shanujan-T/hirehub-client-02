import type { User } from "@/types/user";
import type { UserSkill } from "@/types/skill";
import { Badge, Card } from "@/components/ui";

interface MemberCardProps {
  user: User;
  skills?: UserSkill[];
  reviews?: { rating: number; comment?: string | null }[];
}

export function MemberCard({ user, skills = [], reviews = [] }: MemberCardProps) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{user.full_name}</h3>
          <p className="text-sm text-muted">{user.location}</p>
        </div>
        <Badge variant="success">
          ★ {user.rating?.toFixed(1) ?? "0.0"}
        </Badge>
      </div>
      <div className="flex gap-4 text-sm">
        <span>Projects: {user.completed_project_count ?? 0}</span>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((s) => (
            <Badge key={s.id}>
              {s.skill?.name} ({s.level})
            </Badge>
          ))}
        </div>
      )}
      {reviews.length > 0 && (
        <div className="space-y-1 border-t border-border pt-2">
          {reviews.slice(0, 2).map((r, i) => (
            <p key={i} className="text-xs text-muted">
              ★{r.rating} — {r.comment}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}
