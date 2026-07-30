"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingState } from "@/components/page-states";
import { MY_COMMUNITIES_RETURN, profileAccountSectionHref, safeReturnPath } from "@/lib/return-navigation";

/** Legacy NIC flow URL — redirects to profile account verification (OTP). */
function IdentityVerificationRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("returnTo"), MY_COMMUNITIES_RETURN);

  useEffect(() => {
    router.replace(profileAccountSectionHref(returnTo));
  }, [router, returnTo]);

  return <LoadingState />;
}

export default function IdentityVerificationPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <IdentityVerificationRedirect />
    </Suspense>
  );
}
