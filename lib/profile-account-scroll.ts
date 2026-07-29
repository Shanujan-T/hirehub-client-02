"use client";

import { useEffect } from "react";
import {
  PROFILE_ACCOUNT_SECTION_ID,
  PROFILE_IDENTITY_SECTION_ID,
} from "@/lib/return-navigation";

function hashTargetsIdentitySection(hash: string): boolean {
  return (
    hash === `#${PROFILE_IDENTITY_SECTION_ID}` ||
    hash === `#${PROFILE_ACCOUNT_SECTION_ID}`
  );
}

/** Scroll to the identity verification section when the URL hash targets it (e.g. from Create Community modal). */
export function useScrollToIdentitySection() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hashTargetsIdentitySection(window.location.hash)) return;

    const el = document.getElementById(PROFILE_IDENTITY_SECTION_ID);
    if (!el) return;

    const frame = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
}

/** @deprecated Use useScrollToIdentitySection */
export function useScrollToAccountSection() {
  useScrollToIdentitySection();
}
