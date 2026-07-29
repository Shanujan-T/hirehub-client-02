"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import { Badge, Button, Input, Label } from "@/components/ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DocumentUploadControl, validateNicDocumentFile } from "@/components/document-upload-control";
import { identityVerificationSchema, type IdentityVerificationForm } from "@/lib/schemas";
import { PROFILE_IDENTITY_VERIFIED_TOOLTIP } from "@/lib/identity-verified-copy";
import { notify } from "@/lib/notify";
import { getErrorMessage } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { PROFILE_IDENTITY_SECTION_ID } from "@/lib/return-navigation";
import { submitIdentityVerification, uploadNicDocument } from "@/services/user";
import type { IdentityStatus } from "@/types/user";

function IdentityStatusBadge({ status }: { status: IdentityStatus }) {
  if (status === "verified") {
    return (
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="completed" className="normal-case">
            Verified
          </Badge>
        </TooltipTrigger>
        <TooltipContent>{PROFILE_IDENTITY_VERIFIED_TOOLTIP}</TooltipContent>
      </Tooltip>
    );
  }
  if (status === "pending") {
    return (
      <div className="flex flex-col items-end gap-1 sm:items-start">
        <Badge variant="pending" className="normal-case">
          Pending Review
        </Badge>
        <p className="text-xs text-muted">Usually takes 1–2 business days</p>
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <Badge variant="rejected" className="normal-case">
        Rejected
      </Badge>
    );
  }
  return (
    <Badge variant="default" className="normal-case">
      Unverified
    </Badge>
  );
}

export function ProfileIdentityVerificationSection() {
  const { user, updateUser } = useAuth();
  const status: IdentityStatus = user?.identity_status ?? "unverified";
  const editable = status === "unverified" || status === "rejected";
  const locked = status === "pending" || status === "verified";

  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IdentityVerificationForm>({
    resolver: zodResolver(identityVerificationSchema),
    defaultValues: { nic_number: "" },
  });

  useEffect(() => {
    if (editable) {
      reset({ nic_number: "" });
      setDocumentFile(null);
    }
  }, [status, editable, reset]);

  const onSubmit = async (data: IdentityVerificationForm) => {
    if (!editable) return;
    if (!documentFile) {
      notify.error("Please upload your NIC document.");
      return;
    }
    const fileError = validateNicDocumentFile(documentFile);
    if (fileError) {
      notify.error(fileError);
      return;
    }

    setSubmitting(true);
    try {
      const nic_document_url = await uploadNicDocument(documentFile);
      const updated = await submitIdentityVerification({
        nic_number: data.nic_number.trim().toUpperCase(),
        nic_document_url,
      });
      updateUser(updated);
      reset({ nic_number: "" });
      setDocumentFile(null);
      notify.success("Submitted for verification");
    } catch (err) {
      notify.error(getErrorMessage(err, "Failed to submit identity verification"));
    } finally {
      setSubmitting(false);
    }
  };

  const maskedNic = user?.nic_masked ?? "";

  return (
    <div id={PROFILE_IDENTITY_SECTION_ID} className="scroll-mt-6 space-y-3 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Lock className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
            Identity Verification
          </p>
          <p className="mt-1 text-xs text-muted">
            Required to create or manage a community. Reviewed manually by our team — not shown publicly.
          </p>
        </div>
        <IdentityStatusBadge status={status} />
      </div>

      {status === "rejected" && user?.identity_rejection_reason && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          {user.identity_rejection_reason}
        </p>
      )}

      <div className="space-y-2">
        <Label htmlFor="profile-nic-number">NIC Number</Label>
        {locked ? (
          <Input
            id="profile-nic-number"
            value={maskedNic}
            readOnly
            disabled
            className="opacity-70"
            placeholder={maskedNic ? undefined : "On file"}
          />
        ) : (
          <>
            <Input
              id="profile-nic-number"
              {...register("nic_number")}
              placeholder="e.g. 200012345678"
              autoComplete="off"
            />
            {errors.nic_number && (
              <p className="text-xs text-destructive">{errors.nic_number.message}</p>
            )}
          </>
        )}
      </div>

      <DocumentUploadControl
        label="NIC Document (front side)"
        file={documentFile}
        onFileChange={setDocumentFile}
        disabled={!editable}
        helperText="JPG, PNG, or PDF up to 5MB."
      />

      {editable && (
        <Button
          type="button"
          variant="gradient"
          className="rounded-full"
          disabled={submitting}
          onClick={handleSubmit(onSubmit)}
        >
          {submitting ? "Submitting…" : "Submit for Verification"}
        </Button>
      )}

      {status !== "verified" && (
        <p className="text-xs text-muted">Complete identity verification to create a community.</p>
      )}
    </div>
  );
}
