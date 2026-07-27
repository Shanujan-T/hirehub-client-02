"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, adminNav } from "@/components/portal-shell";
import { EmptyState, LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getErrorMessage } from "@/lib/utils";
import { getReports, updateReport } from "@/services/platform";

export default function AdminReportsPage() {
  const { data: reports, loading, reload } = useAsyncList(useCallback(() => getReports(), []));

  const handleResolve = async (id: number) => {
    try {
      await updateReport(id, { status: "resolved" });
      toast.success("Report updated");
      reload();
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <PortalShell title="Reports" subtitle="Disputes and moderation" navItems={adminNav}>
        {loading ? <LoadingState /> : reports.length === 0 ? (
          <EmptyState title="No reports" />
        ) : (
          reports.map((r) => (
            <Card key={r.id} className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div><p className="font-bold">#{r.id}</p><p className="text-sm text-muted">{r.reason}</p></div>
              <Button variant="outline" size="sm" onClick={() => handleResolve(r.id)}>Resolve</Button>
            </Card>
          ))
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
