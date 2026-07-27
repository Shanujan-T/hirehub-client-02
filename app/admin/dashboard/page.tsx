"use client";

import { AuthenticatedRoute } from "@/components/auth-guard";
import { PortalShell, adminNav } from "@/components/portal-shell";
import { Card } from "@/components/ui";

export default function AdminDashboardPage() {
  return (
    <AuthenticatedRoute allowedRoles={["admin"]}>
      <PortalShell title="Platform Admin" subtitle="Manage categories, users, and reports" navItems={adminNav}>
        <Card>
          <p className="text-muted">Use the sidebar to manage job categories, seed pricing, review reports, and browse users.</p>
        </Card>
      </PortalShell>
    </AuthenticatedRoute>
  );
}
