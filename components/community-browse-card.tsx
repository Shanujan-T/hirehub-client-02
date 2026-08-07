import Link from "next/link";
import { CommunityAvatar } from "@/components/community-avatar";
import { Badge, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { Community } from "@/types/community";

/** Member count + reputation chips — same badges as public /communities browse. */
export function CommunityStatChips({
  memberCount,
  reputationScore,
  className,
}: {
  memberCount?: number | null;
  reputationScore: number;
  className?: string;
}) {
  return (
    <div className={cn("mt-2 flex flex-wrap gap-2", className)}>
      <Badge variant="info">{memberCount ?? 0} members</Badge>
      <Badge variant="completed">★ {Number(reputationScore ?? 0).toFixed(1)}</Badge>
    </div>
  );
}

/**
 * Shared community browse card (public /communities + member Browse & Join).
 * Compact padding so avatar + name + chips feel proportionate.
 */
export function CommunityBrowseCard({
  community,
  href,
  action,
  className,
}: {
  community: Community;
  /** When set, the name links here (use for member list with a separate Join button). */
  href?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  const title = href ? (
    <Link href={href} className="font-bold hover:text-info">
      {community.name}
    </Link>
  ) : (
    <h3 className="font-bold">{community.name}</h3>
  );

  return (
    <Card
      className={cn(
        "p-4",
        action && "flex flex-wrap items-center justify-between gap-3",
        className
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <CommunityAvatar name={community.name} imageUrl={community.image_url} size="md" />
        <div className="min-w-0 flex-1">
          {title}
          {community.location ? (
            <p className="text-sm text-muted">{community.location}</p>
          ) : null}
          <CommunityStatChips
            memberCount={community.member_count}
            reputationScore={community.reputation_score}
          />
        </div>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </Card>
  );
}
