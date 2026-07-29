"use client";

import { useEffect } from "react";
import { PROFILE_IDENTITY_SECTION_ID } from "@/lib/return-navigation";

/** Scroll to the identity section when the URL hash targets it (e.g. from Create Community modal). */
export function useScrollToIdentitySection() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== `#${PROFILE_IDENTITY_SECTION_ID}`) return;

    const el = document.getElementById(PROFILE_IDENTITY_SECTION_ID);
    if (!el) return;

    const frame = requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, []);
}
