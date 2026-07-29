"use client";

import { useEffect } from "react";
import {
  LEGACY_PROFILE_IDENTITY_SECTION_HASH,
  PROFILE_ACCOUNT_SECTION_ID,
} from "@/lib/return-navigation";

function hashTargetsAccountSection(hash: string): boolean {
  return (
    hash === `#${PROFILE_ACCOUNT_SECTION_ID}` ||
    hash === `#${LEGACY_PROFILE_IDENTITY_SECTION_HASH}`
  );
}

/** Scroll to the account verification section when the URL hash targets it (e.g. from Create Community modal). */
export function useScrollToAccountSection() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!hashTargetsAccountSection(window.location.hash)) return;

    const el = document.getElementById(PROFILE_ACCOUNT_SECTION_ID);
    if (!el) return;

    const frame = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
}

/** @deprecated Use useScrollToAccountSection */
export function useScrollToIdentitySection() {
  useScrollToAccountSection();
}
