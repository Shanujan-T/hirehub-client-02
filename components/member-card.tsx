import Link from "next/link";
import { Crown } from "lucide-react";
import type { User } from "@/types/user";
import type { UserSkill } from "@/types/skill";
import { Badge, Card } from "@/components/ui";
import { UserAvatar } from "@/components/user-avatar";
import { cn } from "@/lib/utils";

const nameLinkClass =
  "font-bold text-foreground transition hover:text-info hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-info/30 rounded-sm";

export function AdminRoleBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm shadow-secondary/25",
        className
      )}
    >
      <Crown className="h-3 w-3" aria-hidden />
      Admin
    </span>
  );
}

/** Sort community members so admins appear first (stable for equal roles). */
export function sortMembersAdminFirst<T extends { role?: string | null; id?: number }>(
  members: T[]
): T[] {
  return [...members].sort((a, b) => {
    const aAdmin = a.role === "admin" ? 0 : 1;
    const bAdmin = b.role === "admin" ? 0 : 1;
    if (aAdmin !== bAdmin) return aAdmin - bAdmin;
    return (a.id ?? 0) - (b.id ?? 0);
  });
}

export function MemberCard({
  user,
  skills,
  nameHref,
  onNameClick,
  interactive,
  role,
}: {
  user: User;
  skills?: UserSkill[];
  /** When set, the member name links to a detail view. */
  nameHref?: string;
  onNameClick?: () => void;
  /** Style the name like a link when a parent wraps the card in navigation. */
  interactive?: boolean;
  /** Community membership role — shows Admin badge when "admin". */
  role?: "admin" | "member" | string | null;
}) {
  const displaySkills = skills ?? user.user_skills ?? [];
  const projectCount = user.completed_project_count ?? 0;
  const isAdmin = role === "admin";

  const nameRow = (nameNode: React.ReactNode) => (
    <div className="flex flex-wrap items-center gap-2">
      {nameNode}
      {isAdmin && <AdminRoleBadge />}
    </div>
  );

  return (
    <div className="flex items-start gap-3">
      <UserAvatar name={user.full_name} avatarUrl={user.avatar_url} size="md" />
      <div className="min-w-0 flex-1">
        {nameHref ? (
          nameRow(
            <Link href={nameHref} className={nameLinkClass}>
              {user.full_name}
            </Link>
          )
        ) : onNameClick ? (
          nameRow(
            <button type="button" onClick={onNameClick} className={cn(nameLinkClass, "text-left")}>
              {user.full_name}
            </button>
          )
        ) : (
          nameRow(
            <h3 className={cn("font-bold", interactive && "group-hover:text-info group-hover:underline")}>
              {user.full_name}
            </h3>
          )
        )}
        {user.location && <p className="text-sm text-muted">{user.location}</p>}
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

export function MemberCardPanel({
  user,
  skills,
  detailHref,
  role,
}: {
  user: User;
  skills?: UserSkill[];
  /** When set, the whole card navigates to the member detail view. */
  detailHref?: string;
  role?: "admin" | "member" | string | null;
}) {
  const isAdmin = role === "admin";
  const card = (
    <Card
      className={cn(
        detailHref &&
          "transition hover:border-info/40 hover:shadow-sm focus-within:border-info/40 focus-within:ring-2 focus-within:ring-info/20",
        isAdmin &&
          "border-secondary/40 bg-secondary/[0.04] shadow-sm shadow-secondary/10 dark:border-secondary/50 dark:bg-secondary/10"
      )}
    >
      <MemberCard user={user} skills={skills} interactive={!!detailHref} role={role} />
    </Card>
  );

  if (detailHref) {
    return (
      <Link href={detailHref} className="group block text-inherit no-underline">
        {card}
      </Link>
    );
  }

  return card;
}
