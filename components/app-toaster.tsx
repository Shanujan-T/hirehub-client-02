"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

/** Bottom-right toast stack; styled in globals.css. Newest toast sits closest to the corner. */
export function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      position="bottom-right"
      closeButton
      expand={false}
      visibleToasts={5}
      offset={16}
      gap={10}
      toastOptions={{
        duration: 5000,
        classNames: {
          toast: "hirehub-toast",
          title: "hirehub-toast-title",
          description: "hirehub-toast-description",
          actionButton: "hirehub-toast-action",
          cancelButton: "hirehub-toast-cancel",
          closeButton: "hirehub-toast-close",
        },
      }}
    />
  );
}
