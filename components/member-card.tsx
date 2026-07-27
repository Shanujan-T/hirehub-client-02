import type { User } from "@/types/user";
import type { UserSkill } from "@/types/skill";
import { Badge, Card } from "@/components/ui";

export function MemberCard({ user, skills = [] }: { user: User; skills?: UserSkill[] }) {
  const initials = user.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-full bg-brand-gradient p-[2px]">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-sm font-bold text-secondary">
          {initials}
        </div>
      </div>
      <div className="flex-1">
        <h3 className="font-bold">{user.full_name}</h3>
        <p className="text-sm text-muted">{user.location}</p>
        <Badge variant="info" className="mt-1">★ {user.rating?.toFixed(1) ?? "0.0"}</Badge>
        {skills.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {skills.map((s) => (
              <Badge key={s.id} variant="info">{s.skill?.name}</Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function MemberCardPanel({ user, skills }: { user: User; skills?: UserSkill[] }) {
  return (
    <Card>
      <MemberCard user={user} skills={skills} />
    </Card>
  );
}
