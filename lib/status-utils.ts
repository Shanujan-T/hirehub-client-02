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

export function formatStatus(s: string) {
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
