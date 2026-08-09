"use client";

import Link from "next/link";
import { Building2, CircleDollarSign, ClipboardList } from "lucide-react";
import { DashboardPortalShell } from "@/components/portal-shell";
import { Card } from "@/components/ui";

const destinations = [
  { href: "/employer/communities", label: "My Communities", detail: "Join or manage a working community", icon: Building2 },
  { href: "/employer/my-contracts", label: "My Contracts", detail: "Track assigned work and deliverables", icon: ClipboardList },
  { href: "/employer/earnings", label: "Earnings", detail: "Review payments for completed work", icon: CircleDollarSign },
];

export default function EmployerDashboardPage() {
  return (
    <DashboardPortalShell title="Employer Dashboard" subtitle="Community membership, contracted work, and earnings">
      <div className="grid gap-4 md:grid-cols-3">
        {destinations.map(({ href, label, detail, icon: Icon }) => (
          <Link href={href} key={href}>
            <Card className="h-full p-5 transition hover:border-info">
              <Icon className="mb-3 h-6 w-6 text-info" />
              <h2 className="font-bold">{label}</h2>
              <p className="mt-1 text-sm text-muted">{detail}</p>
            </Card>
          </Link>
        ))}
      </div>
    </DashboardPortalShell>
  );
}
