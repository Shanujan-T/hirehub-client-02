import Link from "next/link";
import type { User } from "@/types/user";
import type { UserSkill } from "@/types/skill";
import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

const nameLinkClass =
  "font-bold text-foreground transition hover:text-info hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/30 rounded-sm";

export function MemberCard({
  user,
  skills,
  nameHref,
  onNameClick,
}: {
  user: User;
  skills?: UserSkill[];
  /** When set, the member name links to a detail view. */
  nameHref?: string;
  onNameClick?: () => void;
}) {  const displaySkills = skills ?? user.user_skills ?? [];
  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const projectCount = user.completed_project_count ?? 0;

  return (
    <div className="flex items-start gap-3">
      <div className="rounded-full bg-brand-gradient p-[2px]">
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-card text-sm font-bold text-secondary">
          {initials}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        {nameHref ? (
          <Link href={nameHref} className={nameLinkClass}>
            {user.full_name}
          </Link>
        ) : onNameClick ? (
          <button type="button" onClick={onNameClick} className={cn(nameLinkClass, "text-left")}>
            {user.full_name}
          </button>
        ) : (
          <h3 className="font-bold">{user.full_name}</h3>
        )}        {user.location && <p className="text-sm text-muted">{user.location}</p>}
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <Badge variant="completed">★ {user.rating?.toFixed(1) ?? "0.0"}</Badge>
          <span className="text-xs text-muted">
            {projectCount === 1 ? "1 project completed" : `${projectCount} projects completed`}
          </span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {displaySkills.length > 0 ? (
            displaySkills.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-1">
                <Badge variant="info">{s.skill?.name ?? "Skill"}</Badge>
                <Badge variant="default" className="px-1.5 py-0 text-[10px] normal-case">
                  {s.level}
                </Badge>
              </span>
            ))
          ) : (
            <span className="text-xs text-muted">No skills listed</span>
          )}
        </div>
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
