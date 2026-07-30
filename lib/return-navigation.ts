/** Safe in-app return path from query params (blocks open redirects). */
export function safeReturnPath(path: string | null | undefined, fallback: string): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}

export const MY_COMMUNITIES_RETURN = "/member/communities";

/** In-page anchor on member profile for OTP account verification (§27/§31). */
export const PROFILE_ACCOUNT_SECTION_ID = "account-verification";

/** @deprecated Legacy NIC hash — scroll handler still accepts this for bookmarks. */
export const PROFILE_IDENTITY_SECTION_ID = "identity-verification";

export const MEMBER_PROFILE_PATH = "/member/profile";

/** Landing target for Create Community guard — profile account verification section. */
export function profileAccountSectionHref(returnTo: string = MY_COMMUNITIES_RETURN): string {
  return `${MEMBER_PROFILE_PATH}?returnTo=${encodeURIComponent(returnTo)}#${PROFILE_ACCOUNT_SECTION_ID}`;
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
export const LEGACY_PROFILE_IDENTITY_SECTION_HASH = PROFILE_IDENTITY_SECTION_ID;
