"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Flag } from "lucide-react";
import { notify } from "@/lib/notify";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, adminNav } from "@/components/portal-shell";
import { StatCard, StatCardGrid, DashboardPanel } from "@/components/stat-card";
import { StatusBadge } from "@/components/status-badge";
import { LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { useAsyncList } from "@/lib/hooks/use-async";
import { getErrorMessage } from "@/lib/utils";
import { getReports, getUsers, updateReport, type Report } from "@/services/platform";

function formatReportDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function AdminReportsPage() {
  const { data: reports, loading, reload } = useAsyncList(useCallback(() => getReports(), []));
  const [usersById, setUsersById] = useState<Record<number, string>>({});

  useEffect(() => {
    getUsers()
      .then((users) => {
        setUsersById(Object.fromEntries(users.map((user) => [user.id, user.full_name])));
      })
      .catch(() => {});
  }, []);

  const openReports = useMemo(
    () => reports.filter((report) => report.status === "open").length,
    [reports]
  );

  const handleResolve = async (id: number) => {
    try {
      await updateReport(id, { status: "resolved" });
      notify.success("Report updated");
      reload();
    } catch (err) {
      notify.error(getErrorMessage(err));
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <PortalShell title="Reports" subtitle="Disputes and moderation" navItems={adminNav}>
        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-8">
            <StatCardGrid className="sm:grid-cols-2 xl:grid-cols-3">
              <StatCard label="Total Reports" value={reports.length} icon={Flag} iconClassName="bg-brand-gradient" />
              <StatCard label="Open Reports" value={openReports} icon={Flag} iconClassName="bg-gradient-to-br from-accent to-destructive" />
              <StatCard
                label="Resolved"
                value={reports.filter((report) => report.status === "resolved").length}
                icon={Flag}
                iconClassName="bg-gradient-to-br from-secondary to-accent"
              />
            </StatCardGrid>

            <DashboardPanel title="Report queue" subtitle="Review disputes and moderation items">
              {reports.length === 0 ? (
                <Card className="border-dashed bg-background/60 p-8 text-center shadow-none">
                  <p className="font-semibold text-foreground">No reports</p>
                  <p className="mt-1 text-sm text-muted">Submitted disputes and moderation reports will appear here.</p>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {reports.map((report) => (
                    <ReportCard
                      key={report.id}
                      report={report}
                      reporterName={usersById[report.reporter_id] ?? `User #${report.reporter_id}`}
                      onResolve={handleResolve}
                    />
                  ))}
                </div>
              )}
            </DashboardPanel>
          </div>
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}

function ReportCard({
  report,
  reporterName,
  onResolve,
}: {
  report: Report;
  reporterName: string;
  onResolve: (id: number) => void;
}) {
  return (
    <Card className="p-4 shadow-none">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/admin/reports/${report.id}`} className="font-bold text-foreground hover:text-info">
              Report #{report.id}
            </Link>
            <StatusBadge status={report.status} kind="contract" />
          </div>
          <p className="text-sm text-muted">
            Reporter: <span className="font-medium text-foreground">{reporterName}</span>
          </p>
          <p className="text-sm leading-relaxed text-foreground">{report.reason}</p>
          <p className="text-xs text-muted">{formatReportDate(report.created_at)}</p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link href={`/admin/reports/${report.id}`}>
            <Button variant="outline" size="sm">
              Open
            </Button>
          </Link>
          {report.status === "open" && (
            <Button variant="outline" size="sm" onClick={() => onResolve(report.id)}>
              Resolve
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
