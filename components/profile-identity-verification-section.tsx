"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { Button, Card, Input, Label } from "@/components/ui";
import { notify } from "@/lib/notify";
import { PROFILE_IDENTITY_SECTION_ID } from "@/lib/return-navigation";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  confirmIdentityEmailOtp,
  confirmIdentityPhoneOtp,
  sendIdentityEmailOtp,
  sendIdentityPhoneOtp,
} from "@/services/user";
import type { IdentityStatus } from "@/types/user";

function statusHeadline(status: IdentityStatus | undefined, partial: boolean): string {
  if (status === "verified") return "Verified";
  if (partial) return "Partially verified";
  if (status === "pending") return "Pending review";
  return "Not verified";
}

type ProfileIdentityVerificationSectionProps = {
  /** Preserved for §27 return-url flow on the Profile page wrapper. */
  returnTo?: string;
};

export function ProfileIdentityVerificationSection(_props: ProfileIdentityVerificationSectionProps = {}) {
  const { user, updateUser, refreshUser } = useAuth();
  const status = user?.identity_status ?? "unverified";
  const emailDone = user?.email_verified_for_identity ?? false;
  const phoneDone = user?.phone_verified_for_identity ?? false;
  const partial = !emailDone || !phoneDone;
  const headline = statusHeadline(status, status !== "verified" && (emailDone || phoneDone));

  const [phone, setPhone] = useState(user?.phone_number ?? "");
  const [phoneCode, setPhoneCode] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [phoneBusy, setPhoneBusy] = useState(false);
  const [emailBusy, setEmailBusy] = useState(false);

  const applyUser = async (next: Awaited<ReturnType<typeof confirmIdentityPhoneOtp>>) => {
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
      notify.success(next.identity_status === "verified" ? "Identity verified" : "Phone verified");
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
      notify.success(next.identity_status === "verified" ? "Identity verified" : "Email verified");
    } catch (err) {
      notify.error(getErrorMessage(err, "Invalid email code"));
    } finally {
      setEmailBusy(false);
    }
  };

  if (status === "verified") {
    return (
      <div
        id={PROFILE_IDENTITY_SECTION_ID}
        className="scroll-mt-24 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-muted/20 px-4 py-3"
      >
        <div>
          <p className="text-sm font-semibold text-foreground">Identity Verification</p>
          <p className="text-sm text-muted">Your phone and email are verified. You can create a community when ready.</p>
        </div>
        <StatusBadge status="verified" kind="identity" />
      </div>
    );
  }

  if (status === "pending") {
    return (
      <div id={PROFILE_IDENTITY_SECTION_ID} className="scroll-mt-24">
        <Card className="space-y-3 border-border p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base font-bold text-foreground">Identity Verification</h2>
            <StatusBadge status="pending" kind="identity" />
          </div>
          <p className="text-sm leading-relaxed text-muted">
            A previous document-based submission is still awaiting platform review. New verifications use phone and
            email codes only — contact support if this state persists.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div id={PROFILE_IDENTITY_SECTION_ID} className="scroll-mt-24">
      <Card className="space-y-5 border-border p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-foreground">Identity Verification</h2>
          <StatusBadge status="unverified" kind="identity" />
        </div>
        <p className="text-sm font-medium text-foreground">{headline}</p>
        <p className="text-sm leading-relaxed text-muted">
          Confirm your phone number and email before creating a community. Both steps use one-time codes — no ID
          documents are collected.
        </p>

        <div className="space-y-4 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Phone (SMS code)</p>
            {phoneDone && (
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Verified
              </span>
            )}
          </div>
          {!phoneDone && (
            <>
              <div className="space-y-2">
                <Label htmlFor="identity-phone">Phone number</Label>
                <Input
                  id="identity-phone"
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
                  {phoneBusy ? "Sending…" : phoneCodeSent ? "Resend code" : "Send code"}
                </Button>
              </div>
              {phoneCodeSent && (
                <div className="space-y-2">
                  <Label htmlFor="identity-phone-code">SMS code</Label>
                  <Input
                    id="identity-phone-code"
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
                    Verify phone
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="space-y-4 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">Email ({user?.email ?? "on file"})</p>
            {emailDone && (
              <span className="inline-flex items-center gap-1 text-xs text-success">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Verified
              </span>
            )}
          </div>
          {!emailDone && (
            <>
              <p className="text-xs text-muted">We will send a one-time code to the email on your account.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={emailBusy}
                onClick={handleSendEmail}
              >
                {emailBusy ? "Sending…" : emailCodeSent ? "Resend code" : "Send code"}
              </Button>
              {emailCodeSent && (
                <div className="space-y-2">
                  <Label htmlFor="identity-email-code">Email code</Label>
                  <Input
                    id="identity-email-code"
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
                    Verify email
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}
