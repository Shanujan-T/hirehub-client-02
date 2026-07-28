"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Briefcase, FileText, Flag, Users, UsersRound } from "lucide-react";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { DashboardBarChart, DashboardChartGrid } from "@/components/dashboard-chart";
import { PortalShell, adminNav } from "@/components/portal-shell";
import { StatCard, StatCardGrid } from "@/components/stat-card";
import { LoadingState } from "@/components/page-states";
import { aggregateContractsByStatus, aggregateJobsByCategory } from "@/lib/dashboard-stats";
import { getCommunities } from "@/services/community";
import { getCategories, getJobs } from "@/services/job";
import { getContracts } from "@/services/contract";
import { getReports, getUsers } from "@/services/platform";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(0);
  const [communities, setCommunities] = useState(0);
  const [jobs, setJobs] = useState<Awaited<ReturnType<typeof getJobs>>>([]);
  const [contracts, setContracts] = useState<Awaited<ReturnType<typeof getContracts>>>([]);
  const [openReports, setOpenReports] = useState(0);
  const [categories, setCategories] = useState<Awaited<ReturnType<typeof getCategories>>>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [userRows, communityRows, jobRows, contractRows, reportRows, categoryRows] =
        await Promise.all([
          getUsers(),
          getCommunities(),
          getJobs(),
          getContracts(),
          getReports(),
          getCategories(),
        ]);
      setUsers(userRows.length);
      setCommunities(communityRows.length);
      setJobs(jobRows);
      setContracts(contractRows);
      setOpenReports(reportRows.filter((report) => report.status === "open").length);
      setCategories(categoryRows);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const jobsByCategory = useMemo(
    () => aggregateJobsByCategory(jobs, categories),
    [jobs, categories]
  );
  const contractsByStatus = useMemo(() => aggregateContractsByStatus(contracts), [contracts]);

  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <PortalShell title="Platform Admin" subtitle="Manage categories, users, and reports" navItems={adminNav}>
        {loading ? (
          <LoadingState />
        ) : (
          <div className="space-y-8">
            <StatCardGrid className="md:grid-cols-3 xl:grid-cols-5">
              <StatCard label="Total Users" value={users} icon={Users} />
              <StatCard label="Communities" value={communities} icon={UsersRound} />
              <StatCard label="Jobs" value={jobs.length} icon={Briefcase} />
              <StatCard label="Contracts" value={contracts.length} icon={FileText} />
              <StatCard label="Open Reports" value={openReports} icon={Flag} />
            </StatCardGrid>

            <DashboardChartGrid>
              <DashboardBarChart title="Jobs by category" data={jobsByCategory} gradient="blue" />
              <DashboardBarChart title="Contracts by status" data={contractsByStatus} gradient="brand" />
            </DashboardChartGrid>
          </div>
        )}
      </PortalShell>
    </AuthenticatedRoute>
  );
}
