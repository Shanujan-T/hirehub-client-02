"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, adminNav } from "@/components/portal-shell";
import { StatusBadge } from "@/components/status-badge";
import { LoadingState } from "@/components/page-states";
import { Button, Card } from "@/components/ui";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/utils";
import {
  getReport,
  getReportAiSummary,
  updateReport,
  type Report,
} from "@/services/platform";

export default function AdminReportDetailPage() {
  const params = useParams();
  const reportId = Number(params.id);
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiDirection, setAiDirection] = useState<string | null>(null);
  const [aiUnavailable, setAiUnavailable] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setReport(await getReport(reportId));
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to load report"));
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    if (!reportId) return;
    setAiLoading(true);
    setAiUnavailable(false);
    getReportAiSummary(reportId)
      .then((data) => {
        setAiSummary(data.summary);
        setAiDirection(data.suggested_direction ?? null);
      })
      .catch(() => {
        setAiUnavailable(true);
        setAiSummary(null);
        setAiDirection(null);
      })
      .finally(() => setAiLoading(false));
  }, [reportId]);

  const handleResolve = async () => {
    try {
      const updated = await updateReport(reportId, { status: "resolved" });
      setReport(updated);
      notify.success("Report resolved");
    } catch (err) {
      notify.error(getErrorMessage(err));
    }
  };

  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <PortalShell
        title={`Report #${reportId}`}
        subtitle="Review dispute details before taking action"
        navItems={adminNav}
        backHref="/admin/reports"
        backLabel="Back to reports"
      >
        {loading || !report ? (
          <LoadingState />
        ) : (
          <div className="mx-auto max-w-2xl space-y-4">
            <Card className="space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold">Report details</h2>
                <StatusBadge status={report.status} kind="contract" />
              </div>
              <p className="text-sm text-muted">
                Reporter:{" "}
                <span className="font-medium text-foreground">
                  {report.reporter?.full_name ?? `User #${report.reporter_id}`}
                </span>
              </p>
              <p className="text-sm leading-relaxed text-foreground">{report.reason}</p>
              {report.contract && (
                <div className="rounded-xl border border-border/70 bg-background/40 p-3 text-sm">
                  <p className="font-semibold">Related contract #{report.contract.id}</p>
                  <p className="text-muted">Status: {report.contract.status}</p>
                  {report.contract.job?.title && (
                    <p className="text-muted">Job: {report.contract.job.title}</p>
                  )}
                  {report.contract.community?.name && (
                    <p className="text-muted">Community: {report.contract.community.name}</p>
                  )}
                  {report.contract.deliverable_url && (
                    <a
                      href={report.contract.deliverable_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-info underline"
                    >
                      View deliverable
                    </a>
                  )}
                </div>
              )}
              {report.status === "open" && (
                <Button variant="outline" size="sm" onClick={() => void handleResolve()}>
                  Resolve
                </Button>
              )}
            </Card>

            <Card className="space-y-3 p-5">
              <h3 className="flex items-center gap-2 font-bold">
                <Sparkles className="h-4 w-4" aria-hidden />
                AI Summary
              </h3>
              {aiLoading ? (
                <p className="text-sm text-muted">Generating summary…</p>
              ) : aiUnavailable || !aiSummary ? (
                <p className="text-sm text-muted">
                  AI summary unavailable — review the details manually below.
                </p>
              ) : (
                <>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                    {aiSummary}
                  </p>
                  {aiDirection && (
                    <div className="rounded-xl border border-border/70 bg-background/40 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                        Suggested resolution direction
                      </p>
                      <p className="mt-1 text-sm text-foreground">{aiDirection}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted">
                    AI-generated summary — review the full details before deciding.
                  </p>
                </>
              )}
            </Card>

            <p className="text-xs text-muted">
              AI never resolves disputes automatically.{" "}
              <Link href="/admin/reports" className="text-info underline">
                Return to queue
              </Link>
            </p>
          </div>
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
