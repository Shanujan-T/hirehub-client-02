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

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <Card className="flex flex-col items-center py-12 text-center">
      <Inbox className="mb-3 h-10 w-10 text-muted" />
      <h3 className="font-bold text-primary dark:text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
    </Card>
  );
}
