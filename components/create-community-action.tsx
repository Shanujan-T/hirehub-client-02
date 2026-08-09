"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Lock } from "lucide-react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MY_COMMUNITIES_RETURN, profileAccountSectionHref } from "@/lib/return-navigation";
import { useAuth } from "@/providers/auth-provider";

/** Header action: create community, gated on phone/email OTP account verification (§31). */
export function CreateCommunityAction() {
  const router = useRouter();
  const { user } = useAuth();
  const verified = user?.identity_status === "verified";
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);

  const goToCreate = () => router.push("/employer/communities/new");

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
          <TooltipContent>Complete account verification to create a community.</TooltipContent>
        </Tooltip>
      )}
      <ConfirmDialog
        open={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        onConfirm={() => {
          setVerifyModalOpen(false);
          router.push(profileAccountSectionHref(MY_COMMUNITIES_RETURN));
        }}
        title="Verify your account to create a community"
        description="Confirm your phone or email with a one-time code on your profile. No ID documents or manual review required."
        confirmLabel="Go to account verification"
        confirmVariant="gradient"
        titleId="verify-account-dialog-title"
        descId="verify-account-dialog-desc"
        dismissLabel="Dismiss account verification dialog"
      />
    </>
  );
}
