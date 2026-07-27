import { contractProgress } from "@/lib/status-utils";

export function ContractProgressBar({ status }: { status: string }) {
  const pct = contractProgress(status);
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted">
        <span>Progress</span><span>{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-brand-gradient transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
