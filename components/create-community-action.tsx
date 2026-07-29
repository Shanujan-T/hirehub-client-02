"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MY_COMMUNITIES_RETURN, profileIdentitySectionHref } from "@/lib/return-navigation";
import { useAuth } from "@/providers/auth-provider";

/** Header action: create community, gated on NIC identity verification (admin-reviewed). */
export function CreateCommunityAction() {
  const router = useRouter();
  const { user } = useAuth();
  const verified = user?.identity_status === "verified";
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  const goToCreate = () => router.push("/member/communities/new");

  const handleClick = () => {
    if (verified) {
      goToCreate();
      return;
    }
    setVerifyModalOpen(true);
  };

  const trigger = (
    <Button variant="gradient" size="sm" className="rounded-full" type="button" onClick={handleClick}>
      {!verified && <Lock className="mr-1.5 h-3.5 w-3.5" aria-hidden />}
      Create Community
    </Button>
  );

  return (
    <>
      {verified ? (
        trigger
      ) : (
        <Tooltip>
          <TooltipTrigger>{trigger}</TooltipTrigger>
          <TooltipContent>Complete identity verification to create a community.</TooltipContent>
        </Tooltip>
      )}
      <ConfirmDialog
        open={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        onConfirm={() => {
          setVerifyModalOpen(false);
          router.push(profileIdentitySectionHref(MY_COMMUNITIES_RETURN));
        }}
        title="Verify your identity to create a community"
        description="Submit your NIC for manual review on your profile. Identity document verification is required before you can submit a new community."
        confirmLabel="Go to identity verification"
        confirmVariant="gradient"
        titleId="verify-identity-dialog-title"
        descId="verify-identity-dialog-desc"
        dismissLabel="Dismiss identity verification dialog"
      />
    </>
  );
}
