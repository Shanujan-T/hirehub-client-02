import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui";
import {
  applicationStatusVariant,
  communityStatusVariant,
  contractStatusVariant,
  formatStatus,
  identityStatusVariant,
  accountStatusVariant,
  jobStatusVariant,
  memberStatusVariant,
  type StatusVariant,
} from "@/lib/status-utils";
import { VerifiedIdentityExplainer } from "@/components/verified-identity-badge";

export function StatusBadge({
  status,
  kind = "job",
  showVerifiedExplainer = true,
}: {
  status: string;
  kind?: "job" | "contract" | "application" | "member" | "community" | "identity" | "account";
  /** When false, skip document-review tooltip (used inside VerifiedIdentityBadge). */
  showVerifiedExplainer?: boolean;
}) {
  let variant: StatusVariant = "default";
  if (kind === "job") variant = jobStatusVariant(status);
  else if (kind === "contract") variant = contractStatusVariant(status);
  else if (kind === "application") variant = applicationStatusVariant(status);
  else if (kind === "member") variant = memberStatusVariant(status);
  else if (kind === "community") variant = communityStatusVariant(status);
  else if (kind === "account") variant = accountStatusVariant(status);
  else if (kind === "identity") variant = identityStatusVariant(status);

  const isDocumentVerified = status === "verified" && kind === "identity";
  const label = formatStatus(status, kind);

  const badge = (
    <Badge
      variant={variant}
      className={isDocumentVerified ? "inline-flex items-center gap-1 normal-case" : undefined}
    >
      {isDocumentVerified && <CheckCircle2 className="h-3 w-3 shrink-0" aria-hidden />}
      {label}
    </Badge>
  );

  if (isDocumentVerified && showVerifiedExplainer) {
    return <VerifiedIdentityExplainer>{badge}</VerifiedIdentityExplainer>;
  }

  return badge;
}
