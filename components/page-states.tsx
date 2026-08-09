import type { ReactNode } from "react";
import { Loader2, Inbox } from "lucide-react";
import { Card } from "@/components/ui";

export function LoadingState({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center gap-3 text-muted">
      <Loader2 className="h-8 w-8 animate-spin text-info" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center py-12 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md shadow-secondary/20">
        <Inbox className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="font-bold text-primary dark:text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {children && <div className="mt-3">{children}</div>}
    </Card>
  );
}
