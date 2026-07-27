"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { Badge, Button, Card } from "@/components/ui";
import { getContracts } from "@/services/contract";
import type { Contract } from "@/types/contract";

export default function MemberDashboardPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);

  useEffect(() => {
    getContracts().then(setContracts).catch(console.error);
  }, []);

  return (
    <AuthenticatedRoute allowedRoles={["user"]}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-extrabold">Member Dashboard</h1>
          <p className="text-muted">Your applications, assignments, and earnings</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/member/profile"><Button variant="outline">Profile</Button></Link>
          <Link href="/member/communities"><Button variant="outline">Communities</Button></Link>
          <Link href="/member/contracts"><Button variant="outline">Contracts</Button></Link>
          <Link href="/member/earnings"><Button variant="outline">Earnings</Button></Link>
        </div>
        <div>
          <h2 className="mb-2 text-xl font-bold">Recent Contracts</h2>
          {contracts.slice(0, 5).map((c) => (
            <Card key={c.id} className="mb-2">
              <div className="flex justify-between">
                <span>{c.job?.title ?? `Contract #${c.id}`}</span>
                <Badge>{c.status}</Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AuthenticatedRoute>
  );
}
