export type StatusVariant =
  | "pending"
  | "open"
  | "active"
  | "completed"
  | "rejected"
  | "default";

const JOB: Record<string, StatusVariant> = {
  open: "open",
  assigned: "active",
  closed: "completed",
};

const CONTRACT: Record<string, StatusVariant> = {
  pending_assignment: "pending",
  open_internally: "open",
  active: "active",
  submitted: "open",
  completed: "completed",
  disputed: "rejected",
};

const APPLICATION: Record<string, StatusVariant> = {
  applied: "open",
  approved: "active",
  rejected: "rejected",
  selected: "completed",
};

const MEMBER: Record<string, StatusVariant> = {
  pending: "pending",
  approved: "completed",
  rejected: "rejected",
};

const COMMUNITY: Record<string, StatusVariant> = {
  pending: "pending",
  approved: "completed",
  rejected: "rejected",
};

const IDENTITY: Record<string, StatusVariant> = {
  unverified: "default",
  pending: "pending",
  verified: "completed",
  rejected: "rejected",
};

export function jobStatusVariant(s: string): StatusVariant {
  return JOB[s] ?? "default";
}

export function contractStatusVariant(s: string): StatusVariant {
  return CONTRACT[s] ?? "default";
}

export function applicationStatusVariant(s: string): StatusVariant {
  return APPLICATION[s] ?? "default";
}

export function memberStatusVariant(s: string): StatusVariant {
  return MEMBER[s] ?? "default";
}

export function communityStatusVariant(s: string): StatusVariant {
  return COMMUNITY[s] ?? "default";
}

export function identityStatusVariant(s: string): StatusVariant {
  return IDENTITY[s] ?? "default";
}

const MEMBER_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Active",
  rejected: "Rejected",
};

const COMMUNITY_LABELS: Record<string, string> = {
  pending: "Pending Verification",
  approved: "Approved",
  rejected: "Rejected",
};

const IDENTITY_LABELS: Record<string, string> = {
  unverified: "Unverified",
  pending: "Pending Verification",
  verified: "Verified",
  rejected: "Rejected",
};

/** Phone/email OTP tier (Profile) — reserved "identity" labels for future ID tier / admin legacy. */
const ACCOUNT_LABELS: Record<string, string> = {
  unverified: "Not verified",
  pending: "Not verified",
  verified: "Account verified",
  rejected: "Not verified",
};

export function accountStatusVariant(s: string): StatusVariant {
  return IDENTITY[s] ?? "default";
}

export function formatStatus(
  s: string,
  kind?: "job" | "contract" | "application" | "member" | "community" | "identity" | "account"
) {
  if (kind === "member" && MEMBER_LABELS[s]) {
    return MEMBER_LABELS[s];
  }
  if (kind === "community" && COMMUNITY_LABELS[s]) {
    return COMMUNITY_LABELS[s];
  }
  if (kind === "identity" && IDENTITY_LABELS[s]) {
    return IDENTITY_LABELS[s];
  }
  if (kind === "account" && ACCOUNT_LABELS[s]) {
    return ACCOUNT_LABELS[s];
  }
  return s.replace(/_/g, " ");
}

export function contractProgress(s: string): number {
  const m: Record<string, number> = {
    pending_assignment: 10,
    open_internally: 30,
    active: 55,
    submitted: 75,
    completed: 100,
    disputed: 40,
  };
  return m[s] ?? 0;
}
