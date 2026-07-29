"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LoadingState } from "@/components/page-states";
import { profileIdentitySectionHref, safeReturnPath } from "@/lib/return-navigation";

/** Legacy route — identity verification lives on Profile (#identity-verification). */
function IdentityVerificationRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("returnTo"), "/member/communities");

  useEffect(() => {
    router.replace(profileIdentitySectionHref(returnTo));
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
