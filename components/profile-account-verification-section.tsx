"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/status-badge";
import { Button, Input, Label } from "@/components/ui";
import { notify } from "@/lib/notify";
import { PROFILE_ACCOUNT_SECTION_ID } from "@/lib/return-navigation";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  confirmIdentityEmailOtp,
  sendIdentityEmailOtp,
} from "@/services/user";

type ProfileAccountVerificationSectionProps = {
  /** Preserved for the Profile page wrapper's return-url flow. */
  returnTo?: string;
};

/** Email is the only active account-verification method. */
export function ProfileAccountVerificationSection({}: ProfileAccountVerificationSectionProps = {}) {
  const { user, updateUser, refreshUser } = useAuth();
  const status = user?.identity_status ?? "unverified";
  const emailDone = user?.email_verified_for_identity ?? false;
  const [emailCode, setEmailCode] = useState("");
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);

  const applyUser = async (
    next: Awaited<ReturnType<typeof confirmIdentityEmailOtp>>,
  ) => {
    updateUser(next);
    await refreshUser();
  };

  const handleSendEmail = async () => {
    setEmailBusy(true);
    try {
      const res = await sendIdentityEmailOtp();
      setEmailCodeSent(true);
      notify.success(res.message);
      if (res.dev_code) notify.info(`Dev code: ${res.dev_code}`);
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to send email code"));
    } finally {
      setEmailBusy(false);
    }
  };

  const handleConfirmEmail = async () => {
    setEmailBusy(true);
    try {
      const next = await confirmIdentityEmailOtp(emailCode.trim());
      await applyUser(next);
      setEmailCode("");
      notify.success("Account verified");
    } catch (err) {
      notify.error(getErrorMessage(err, "Invalid email code"));
    } finally {
      setEmailBusy(false);
    }
  };

  return (
    <div
      id={PROFILE_ACCOUNT_SECTION_ID}
      className="scroll-mt-24 space-y-3 rounded-lg border border-border p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Account Verification</p>
          <p className="mt-1 text-xs text-muted">
            Required to create or manage a community. Verify your email with a one-time code.
          </p>
          {status === "verified" && (
            <p className="mt-2 text-sm text-muted">
              {emailDone ? "Your email is confirmed." : "Your account is verified."} You can create a community when ready.
            </p>
          )}
        </div>
        <StatusBadge status={status === "pending" ? "unverified" : status} kind="account" />
      </div>

      {status !== "verified" && (
        <div className="space-y-4 rounded-lg border border-border p-4">
          <p className="text-sm font-semibold">Email ({user?.email ?? "on file"})</p>
          <p className="text-xs text-muted">
            We will send a one-time code to your account email.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={emailBusy}
            onClick={handleSendEmail}
          >
            {emailBusy ? "Sending…" : emailCodeSent ? "Resend email code" : "Send email code"}
          </Button>
          {emailCodeSent && (
            <div className="space-y-2">
              <Label htmlFor="account-email-code">Email code</Label>
              <Input
                id="account-email-code"
                value={emailCode}
                onChange={(event) => setEmailCode(event.target.value)}
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
              />
              <Button
                type="button"
                variant="gradient"
                size="sm"
                className="rounded-full"
                disabled={emailBusy || emailCode.trim().length < 4}
                onClick={handleConfirmEmail}
              >
                Verify email
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
