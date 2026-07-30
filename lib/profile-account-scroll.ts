"use client";

import { useEffect } from "react";
import {
  PROFILE_ACCOUNT_SECTION_ID,
  PROFILE_IDENTITY_SECTION_ID,
} from "@/lib/return-navigation";

function hashTargetsAccountSection(hash: string): boolean {
  return (
    hash === `#${PROFILE_ACCOUNT_SECTION_ID}` ||
    hash === `#${PROFILE_IDENTITY_SECTION_ID}`
  );
}

/** Scroll to account verification when the URL hash targets it (e.g. from Create Community modal). */
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
