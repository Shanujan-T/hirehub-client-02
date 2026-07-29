import { Badge } from "@/components/ui";
import {
  applicationStatusVariant,
  communityStatusVariant,
  contractStatusVariant,
  formatStatus,
  identityStatusVariant,
  jobStatusVariant,
  memberStatusVariant,
  type StatusVariant,
} from "@/lib/status-utils";

export function StatusBadge({
  status,
  kind = "job",
}: {
  status: string;
  kind?: "job" | "contract" | "application" | "member" | "community" | "identity";
}) {
  let variant: StatusVariant = "default";
  if (kind === "job") variant = jobStatusVariant(status);
  else if (kind === "contract") variant = contractStatusVariant(status);
  else if (kind === "application") variant = applicationStatusVariant(status);
  else if (kind === "member") variant = memberStatusVariant(status);
  else if (kind === "community") variant = communityStatusVariant(status);
  else if (kind === "identity") variant = identityStatusVariant(status);
  return <Badge variant={variant}>{formatStatus(status, kind)}</Badge>;
}
