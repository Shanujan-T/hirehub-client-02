"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingState } from "@/components/page-states";

/** Legacy URL — all users land on the unified dashboard. */
export default function MemberDashboardRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard");
  }, [router]);
  return <LoadingState />;
}
