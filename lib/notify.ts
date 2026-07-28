import { toast, type ExternalToast } from "sonner";

/** Auto-dismiss delay for informational notifications. */
export const TOAST_DURATION_MS = 5000;

/** Action-required toasts stay until dismissed or acted on. */
export const PERSISTENT_TOAST_DURATION = Infinity;

type NotifyOptions = ExternalToast & {
  description?: string;
};

type ActionRequiredOptions = NotifyOptions & {
  action?: { label: string; onClick: () => void };
  cancel?: { label: string; onClick?: () => void };
};

export const notify = {
  success(message: string, options?: NotifyOptions) {
    return toast.success(message, {
      duration: TOAST_DURATION_MS,
      ...options,
    });
  },

  error(message: string, options?: NotifyOptions) {
    return toast.error(message, {
      duration: TOAST_DURATION_MS,
      ...options,
    });
  },

  info(message: string, options?: NotifyOptions) {
    return toast.info(message, {
      duration: TOAST_DURATION_MS,
      ...options,
    });
  },

  /** Persists until the user dismisses or completes the action. */
  actionRequired(message: string, options?: ActionRequiredOptions) {
    return toast(message, {
      duration: PERSISTENT_TOAST_DURATION,
      ...options,
    });
  },

  dismiss(id?: string | number) {
    toast.dismiss(id);
  },

  /** §4.3 — client must approve/reject; do not auto-expire. */
  handoverRequest(description: string, onReview: () => void) {
    return notify.actionRequired("Handover request received", {
      description,
      action: { label: "Review", onClick: onReview },
    });
  },

  applicationApproved(communityName: string) {
    return notify.success("Application approved", {
      description: `Your application to ${communityName} was approved.`,
    });
  },

  applicationRejected(communityName: string) {
    return notify.info("Application not selected", {
      description: `Your application to ${communityName} was not selected this time.`,
    });
  },

  contractAssigned(jobTitle: string) {
    return notify.success("Contract assigned", {
      description: `You were assigned to “${jobTitle}”.`,
    });
  },

  /** Disputes need attention — persist until dismissed or viewed. */
  disputeUpdate(contractTitle: string, onView: () => void) {
    return notify.actionRequired("Dispute update", {
      description: `There is an update on “${contractTitle}”.`,
      action: { label: "View", onClick: onView },
    });
  },
};
