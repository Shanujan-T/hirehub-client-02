import type { CommunityMember } from "@/types/community";
import type { UserSkill } from "@/types/skill";
import { UserAvatar } from "@/components/user-avatar";
import { StatusBadge } from "@/components/status-badge";
import { VerifiedIdentityBadge } from "@/components/verified-identity-badge";
import { Badge, Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";

function formatSkillLevel(level: string) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

function formatJoinDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return value;
  }
}

export function CommunityMemberDetail({
  membership,
  contractStats,
  showRemove,
  removing,
  onRemove,
  className,
}: {
  membership: CommunityMember;
  contractStats?: { assigned: number; completed: number };
  showRemove?: boolean;
  removing?: boolean;
  onRemove?: () => void;
  className?: string;
}) {
  const user = membership.user;
  if (!user) {
    return <p className="text-muted">Member profile unavailable.</p>;
  }

  const skills = user.user_skills ?? [];
  const projectCount = user.completed_project_count ?? 0;

  return (
    <Card className={cn("max-w-lg space-y-5 p-5", className)}>
      <div className="flex items-start gap-4">
        <UserAvatar name={user.full_name} avatarUrl={user.avatar_url} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-extrabold text-foreground">{user.full_name}</h2>
            {user.identity_status === "verified" && <VerifiedIdentityBadge variant="compact" />}
          </div>
          {user.location && <p className="text-sm text-muted">{user.location}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {membership.role === "admin" ? (
              <Badge variant="active">Admin</Badge>
            ) : (
              <Badge variant="info">Member</Badge>
            )}
            <StatusBadge status="approved" kind="member" />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-foreground">Bio</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">
          {user.bio?.trim() ? user.bio : "No bio provided."}
        </p>
      </div>

      <div className="flex flex-wrap gap-4 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Rating</p>
          <p className="mt-0.5 font-bold text-foreground">★ {user.rating?.toFixed(1) ?? "0.0"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Projects</p>
          <p className="mt-0.5 font-bold text-foreground">
            {projectCount === 1 ? "1 completed" : `${projectCount} completed`}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Joined</p>
          <p className="mt-0.5 font-bold text-foreground">{formatJoinDate(membership.joined_at)}</p>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-foreground">Skills</h3>
        {skills.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {skills.map((skill: UserSkill) => (
              <li
                key={skill.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/70 bg-background/40 px-3 py-2 text-sm"
              >
                <span className="font-medium text-foreground">{skill.skill?.name ?? "Skill"}</span>
                <Badge variant="default" className="normal-case">
                  {formatSkillLevel(skill.level)}
                </Badge>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-sm text-muted">No skills listed.</p>
        )}
      </div>

      {contractStats && (
        <div>
          <h3 className="text-sm font-bold text-foreground">Contracts in this community</h3>
          <p className="mt-1 text-sm text-muted">
            {contractStats.assigned} assigned · {contractStats.completed} completed
          </p>
        </div>
      )}

      {showRemove && onRemove && (
        <div className="border-t border-border pt-4">
          <Button
            variant="outline"
            className="text-destructive hover:border-destructive hover:text-destructive"
            disabled={removing}
            onClick={onRemove}
          >
            {removing ? "Removing…" : "Remove from community"}
          </Button>
        </div>
      )}
    </Card>
  );
}
