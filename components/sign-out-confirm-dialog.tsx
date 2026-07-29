"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

export function SignOutConfirmDialog({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Sign out of HireHub?"
      description="You'll need to log back in to access your dashboard."
      confirmLabel="Sign out"
      confirmVariant="destructive"
      titleId="sign-out-dialog-title"
      descId="sign-out-dialog-desc"
      dismissLabel="Dismiss sign out dialog"
    />
  );
}

/** Sign out button + confirmation dialog — use anywhere sign-out is offered. */
export function SignOutControl({
  className,
  size = "sm",
  children,
}: {
  className?: string;
  size?: "default" | "sm" | "lg";
  children?: React.ReactNode;
}) {
  const { logout } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={size}
        className={cn("rounded-full", className)}
        onClick={() => setOpen(true)}
      >
        {children ?? "Sign out"}
      </Button>
      <SignOutConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          logout();
          setOpen(false);
        }}
      />
    </>
  );
}
