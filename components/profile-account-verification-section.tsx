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
  confirmIdentityPhoneOtp,
  sendIdentityEmailOtp,
  sendIdentityPhoneOtp,
} from "@/services/user";

type ProfileAccountVerificationSectionProps = {
  /** Preserved for §27 return-url flow on the Profile page wrapper. */
  returnTo?: string;
};

function verifiedViaLabel(phone: boolean, email: boolean): string {
  if (phone && email) return "Your phone and email are confirmed.";
  if (phone) return "Your phone number is confirmed.";
  if (email) return "Your email is confirmed.";
  return "Your account is verified.";
}

export function ProfileAccountVerificationSection({}: ProfileAccountVerificationSectionProps = {}) {
  const { user, updateUser, refreshUser } = useAuth();
  const status = user?.identity_status ?? "unverified";
  const phoneDone = user?.phone_verified_for_identity ?? false;
  const emailDone = user?.email_verified_for_identity ?? false;

  const [phone, setPhone] = useState(user?.phone_number ?? "");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [phoneBusy, setPhoneBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);

  const applyUser = async (
    next: Awaited<ReturnType<typeof confirmIdentityPhoneOtp>>,
  ) => {
    updateUser(next);
    await refreshUser();
  };

  const handleSendPhone = async () => {
    setPhoneBusy(true);
    try {
      const res = await sendIdentityPhoneOtp(phone.trim());
      setPhoneCodeSent(true);
      notify.success(res.message);
      if (res.dev_code) {
        notify.info(`Dev code: ${res.dev_code}`);
      }
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to send SMS code"));
    } finally {
      setPhoneBusy(false);
    }
  };

  const handleConfirmPhone = async () => {
    setPhoneBusy(true);
    try {
      const next = await confirmIdentityPhoneOtp(phoneCode.trim());
      await applyUser(next);
      setPhoneCode("");
      notify.success("Account verified");
    } catch (err) {
      notify.error(getErrorMessage(err, "Invalid phone code"));
    } finally {
      setPhoneBusy(false);
    }
  };

  const handleSendEmail = async () => {
    setEmailBusy(true);
    try {
      const res = await sendIdentityEmailOtp();
      setEmailCodeSent(true);
      notify.success(res.message);
      if (res.dev_code) {
        notify.info(`Dev code: ${res.dev_code}`);
      }
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

  if (status === "verified") {
    return (
      <div
        id={PROFILE_ACCOUNT_SECTION_ID}
        className="scroll-mt-6 space-y-3 rounded-lg border border-border p-4"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Account Verification
            </p>
            <p className="mt-1 text-xs text-muted">
              Required to create or manage a community. Confirmed instantly — no
              documents or manual review.
            </p>
            <p className="mt-2 text-sm text-muted">
              {verifiedViaLabel(phoneDone, emailDone)} You can create a
              community when ready.
            </p>
          </div>
          <StatusBadge status="verified" kind="account" />
        </div>
      </div>
    );
  }

  return (
    <div
      id={PROFILE_ACCOUNT_SECTION_ID}
      className="scroll-mt-6 space-y-3 rounded-lg border border-border p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-foreground">
            Account Verification
          </p>
          <p className="mt-1 text-xs text-muted">
            Required to create or manage a community. Confirm your phone or
            email with a one-time code — no ID documents or manual review.
          </p>
        </div>
        <StatusBadge
          status={status === "pending" ? "unverified" : status}
          kind="account"
        />
      </div>

      <div className="space-y-4 rounded-lg border border-border p-4">
        <p className="text-sm font-semibold">Phone (recommended)</p>
        <div className="space-y-2">
          <Label htmlFor="account-phone">Phone number</Label>
          <Input
            id="account-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+94771234567"
            autoComplete="tel"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={phoneBusy || !phone.trim()}
            onClick={handleSendPhone}
          >
            {phoneBusy
              ? "Sending…"
              : phoneCodeSent
                ? "Resend SMS code"
                : "Send SMS code"}
          </Button>
        </div>
        {phoneCodeSent && (
          <div className="space-y-2">
            <Label htmlFor="account-phone-code">SMS code</Label>
            <Input
              id="account-phone-code"
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="6-digit code"
            />
            <Button
              type="button"
              variant="gradient"
              size="sm"
              className="rounded-full"
              disabled={phoneBusy || phoneCode.trim().length < 4}
              onClick={handleConfirmPhone}
            >
              Verify with phone
            </Button>
          </div>
        )}
      </div>

      <div className="relative flex items-center gap-3 py-1">
        <div className="h-px flex-1 bg-border" aria-hidden />
        <span className="text-xs font-medium text-muted">Or</span>
        <div className="h-px flex-1 bg-border" aria-hidden />
      </div>

      <div className="space-y-4 rounded-lg border border-dashed border-border p-4">
        <p className="text-sm font-semibold">
          Email ({user?.email ?? "on file"})
        </p>
        <p className="text-xs text-muted">
          Use email if SMS is unavailable. We will send a one-time code to your
          account email.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full"
          disabled={emailBusy}
          onClick={handleSendEmail}
        >
          {emailBusy
            ? "Sending…"
            : emailCodeSent
              ? "Resend email code"
              : "Send email code"}
        </Button>
        {emailCodeSent && (
          <div className="space-y-2">
            <Label htmlFor="account-email-code">Email code</Label>
            <Input
              id="account-email-code"
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
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
              Verify with email
            </Button>
          </div>
        )}
      </div>

      <p className="text-xs text-muted">
        Complete account verification to create a community.
      </p>
    </div>
  );
}
