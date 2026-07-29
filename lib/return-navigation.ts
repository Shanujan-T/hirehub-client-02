/** Safe in-app return path from query params (blocks open redirects). */
export function safeReturnPath(path: string | null | undefined, fallback: string): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}

export const MY_COMMUNITIES_RETURN = "/member/communities";

/** In-page anchor on member profile for NIC identity verification (§27 deep link). */
export const PROFILE_IDENTITY_SECTION_ID = "identity-verification";

/** @deprecated Old account OTP hash — scroll handler still accepts this for bookmarks. */
export const PROFILE_ACCOUNT_SECTION_ID = "account-verification";

export const MEMBER_PROFILE_PATH = "/member/profile";

/** Landing target for Create Community guard — member profile identity section. */
export function profileIdentitySectionHref(returnTo: string = MY_COMMUNITIES_RETURN): string {
  return `${MEMBER_PROFILE_PATH}?returnTo=${encodeURIComponent(returnTo)}#${PROFILE_IDENTITY_SECTION_ID}`;
}

/** @deprecated Use profileIdentitySectionHref */
export function profileAccountSectionHref(returnTo: string = MY_COMMUNITIES_RETURN): string {
  return profileIdentitySectionHref(returnTo);
}

/** @deprecated Use profileIdentitySectionHref */
export function identityVerificationFlowHref(returnTo: string = MY_COMMUNITIES_RETURN): string {
  return profileIdentitySectionHref(returnTo);
}

/** @deprecated Use profileIdentitySectionHref */
export function identityVerificationHref(returnTo: string = MY_COMMUNITIES_RETURN): string {
  return profileIdentitySectionHref(returnTo);
}

/** @deprecated Use PROFILE_IDENTITY_SECTION_ID */
export const LEGACY_PROFILE_IDENTITY_SECTION_HASH = PROFILE_IDENTITY_SECTION_ID;
