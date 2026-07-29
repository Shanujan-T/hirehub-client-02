/** Safe in-app return path from query params (blocks open redirects). */
export function safeReturnPath(path: string | null | undefined, fallback: string): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}

export const MY_COMMUNITIES_RETURN = "/member/communities";

/** In-page anchor on Profile for account verification (§27 deep link). */
export const PROFILE_ACCOUNT_SECTION_ID = "account-verification";

/** @deprecated Old §27/§28 hash — scroll handler still accepts this for bookmarks. */
export const LEGACY_PROFILE_IDENTITY_SECTION_HASH = "identity-verification";

const PROFILE_PATH = "/dashboard/profile";

/** Landing target for §27 Verify — profile section with optional return path preserved in query. */
export function profileAccountSectionHref(returnTo: string = MY_COMMUNITIES_RETURN): string {
  return `${PROFILE_PATH}?returnTo=${encodeURIComponent(returnTo)}#${PROFILE_ACCOUNT_SECTION_ID}`;
}

/** @deprecated Use profileAccountSectionHref */
export function profileIdentitySectionHref(returnTo: string = MY_COMMUNITIES_RETURN): string {
  return profileAccountSectionHref(returnTo);
}

/** @deprecated Use profileAccountSectionHref */
export function identityVerificationFlowHref(returnTo: string = MY_COMMUNITIES_RETURN): string {
  return profileAccountSectionHref(returnTo);
}

/** @deprecated Use profileAccountSectionHref */
export function identityVerificationHref(returnTo: string = MY_COMMUNITIES_RETURN): string {
  return profileAccountSectionHref(returnTo);
}

/** @deprecated Use PROFILE_ACCOUNT_SECTION_ID */
export const PROFILE_IDENTITY_SECTION_ID = PROFILE_ACCOUNT_SECTION_ID;
