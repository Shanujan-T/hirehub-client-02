"use client";

import { useEffect } from "react";
import {
  PROFILE_ACCOUNT_SECTION_ID,
  PROFILE_IDENTITY_SECTION_ID,
} from "@/lib/return-navigation";

function targetIdFromHash(hash: string): string | null {
  if (!hash || hash === "#") return null;
  const targetId = decodeURIComponent(hash.slice(1));
  // Preserve existing identity-verification bookmarks after the OTP rename.
  return targetId === PROFILE_IDENTITY_SECTION_ID
    ? PROFILE_ACCOUNT_SECTION_ID
    : targetId;
}

/** Scroll to each profile anchor on load and after client-side hash navigation. */
export function useScrollToProfileHash() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let frame: number | undefined;
    const scrollToCurrentHash = () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const targetId = targetIdFromHash(window.location.hash);
        if (!targetId) return;
        document.getElementById(targetId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    };

    scrollToCurrentHash();
    window.addEventListener("hashchange", scrollToCurrentHash);
    window.addEventListener("profile-anchor-navigation", scrollToCurrentHash);
    return () => {
      if (frame !== undefined) cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", scrollToCurrentHash);
      window.removeEventListener("profile-anchor-navigation", scrollToCurrentHash);
    };
  }, []);
}

/** @deprecated Use useScrollToProfileHash. */
export function useScrollToAccountSection() {
  useScrollToProfileHash();
}

/** @deprecated Use useScrollToAccountSection */
export function useScrollToIdentitySection() {
  useScrollToAccountSection();
}
