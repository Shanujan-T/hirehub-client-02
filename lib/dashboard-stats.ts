import type { Category, Job } from "@/types/job";
import type { Contract } from "@/types/contract";

export function aggregateJobsByCategory(jobs: Job[], categories: Category[]) {
  const counts = new Map<number, number>();
  jobs.forEach((job) => {
    counts.set(job.category_id, (counts.get(job.category_id) ?? 0) + 1);
  });

  return categories
    .map((category) => ({
      name: category.name,
      count: counts.get(category.id) ?? 0,
    }))
    .filter((row) => row.count > 0)
    .sort((a, b) => b.count - a.count);
}

const CONTRACT_STATUS_LABELS: Record<string, string> = {
  pending_assignment: "Pending",
  open_internally: "Open internal",
  active: "Active",
  submitted: "Submitted",
  completed: "Completed",
  disputed: "Disputed",
};

export function aggregateContractsByStatus(contracts: Contract[]) {
  const counts = new Map<string, number>();
  contracts.forEach((contract) => {
    counts.set(contract.status, (counts.get(contract.status) ?? 0) + 1);
  });

  return Array.from(counts.entries()).map(([status, count]) => ({
    name: CONTRACT_STATUS_LABELS[status] ?? status,
    count,
  }));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const ACTIVE_CONTRACT_STATUSES = new Set([
  "pending_assignment",
  "open_internally",
  "active",
  "submitted",
  "disputed",
]);
