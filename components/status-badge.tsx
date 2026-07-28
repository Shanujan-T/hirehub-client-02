import { Badge } from "@/components/ui";
import {
  applicationStatusVariant,
  contractStatusVariant,
  formatStatus,
  jobStatusVariant,
  memberStatusVariant,
  type StatusVariant,
} from "@/lib/status-utils";

export function StatusBadge({ status, kind = "job" }: { status: string; kind?: "job" | "contract" | "application" | "member" }) {
  let variant: StatusVariant = "default";
  if (kind === "job") variant = jobStatusVariant(status);
  else if (kind === "contract") variant = contractStatusVariant(status);
  else if (kind === "application") variant = applicationStatusVariant(status);
  else variant = memberStatusVariant(status);
  return <Badge variant={variant}>{formatStatus(status, kind)}</Badge>;
}
