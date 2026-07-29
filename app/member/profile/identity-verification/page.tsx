"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthenticatedRoute } from "@/components/auth-guard";
import { DashboardPortalShell } from "@/components/portal-shell";
import { LoadingState } from "@/components/page-states";
import { StatusBadge } from "@/components/status-badge";
import { Button, Card, Input, Label } from "@/components/ui";
import { identityVerificationSchema, type IdentityVerificationForm } from "@/lib/schemas";
import { IDENTITY_DOCUMENT_REVIEW_NOTICE } from "@/lib/identity-verified-copy";
import { notify } from "@/lib/notify";
import { MY_COMMUNITIES_RETURN, safeReturnPath } from "@/lib/return-navigation";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { submitIdentityVerification, uploadNicDocument } from "@/services/user";

const ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function validateDocument(file: File): string | null {
  const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (!allowed.includes(file.type)) {
    return "Only JPG, PNG, WEBP, and PDF files are allowed.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "File must be 5MB or smaller.";
  }
  return null;
}

function IdentityVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = safeReturnPath(searchParams.get("returnTo"), MY_COMMUNITIES_RETURN);
  const { user, updateUser } = useAuth();
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IdentityVerificationForm>({
    resolver: zodResolver(identityVerificationSchema),
  });

  const status = user?.identity_status ?? "unverified";

  const onSubmit = async (data: IdentityVerificationForm) => {
    if (!documentFile) {
      notify.error("Please upload your NIC document.");
      return;
    }
    const validationError = validateDocument(documentFile);
    if (validationError) {
      notify.error(validationError);
      return;
    }

    setUploading(true);
    try {
      const nic_document_url = await uploadNicDocument(documentFile);
      const updated = await submitIdentityVerification({
        nic_number: data.nic_number.trim().toUpperCase(),
        nic_document_url,
      });
      updateUser(updated);
      notify.success("Identity document submitted for review");
      router.push(returnTo);
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to submit identity verification"));
    } finally {
      setUploading(false);
    }
  };

  const busy = isSubmitting || uploading;

  return (
    <AuthenticatedRoute>
      <DashboardPortalShell
        title="Identity Verification"
        subtitle="Submit your ID document for manual review"
        backHref="/dashboard/profile"
        backLabel="Back to profile"
      >
        <Card className="mx-auto max-w-lg space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted">Current status</p>
            <StatusBadge status={status} kind="identity" />
          </div>

          {status === "verified" ? (
            <p className="text-sm text-muted">
              Your identity document has been reviewed. You can create a community when ready.
            </p>
          ) : status === "pending" ? (
            <p className="text-sm text-muted">
              Your document is under review by our team. We will update your status when review is complete.
            </p>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-sm leading-relaxed text-muted">{IDENTITY_DOCUMENT_REVIEW_NOTICE}</p>

              {status === "rejected" && user?.identity_rejection_reason && (
                <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  Previous submission rejected: {user.identity_rejection_reason}
                </p>
              )}

              <div className="space-y-2">
                <Label htmlFor="nic-number">NIC Number</Label>
                <Input
                  id="nic-number"
                  {...register("nic_number")}
                  placeholder="e.g. 123456789V or 200123456789"
                  autoComplete="off"
                />
                {errors.nic_number && (
                  <p className="text-xs text-destructive">{errors.nic_number.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="nic-document">NIC Document (image or PDF, max 5MB)</Label>
                <input
                  id="nic-document"
                  type="file"
                  accept={ACCEPT}
                  className="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-muted file:px-3 file:py-1.5"
                  onChange={(event) => setDocumentFile(event.target.files?.[0] ?? null)}
                />
                {documentFile && <p className="text-xs text-muted">Selected: {documentFile.name}</p>}
              </div>

              <Button type="submit" variant="gradient" disabled={busy} className="w-full rounded-full">
                {busy ? "Submitting..." : "Submit for Review"}
              </Button>

              <p className="text-center text-xs text-muted">
                You can also submit from{" "}
                <Link href="/member/profile#identity-verification" className="text-info hover:underline">
                  My Profile
                </Link>
                .
              </p>
            </form>
          )}
        </Card>
      </DashboardPortalShell>
    </AuthenticatedRoute>
  );
}

export default function IdentityVerificationPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <IdentityVerificationContent />
    </Suspense>
  );
}
