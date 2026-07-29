/** Safe in-app return path from query params (blocks open redirects). */
export function safeReturnPath(path: string | null | undefined, fallback: string): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return fallback;
  }
  return path;
}

export const MY_COMMUNITIES_RETURN = "/member/communities";

/** In-page anchor on Profile for identity verification (§27 deep link). */
export const PROFILE_IDENTITY_SECTION_ID = "identity-verification";

const PROFILE_PATH = "/dashboard/profile";

/** Landing target for §27 Verify — profile section with optional return path preserved in query. */
export function profileIdentitySectionHref(returnTo: string = MY_COMMUNITIES_RETURN): string {
  return `${PROFILE_PATH}?returnTo=${encodeURIComponent(returnTo)}#${PROFILE_IDENTITY_SECTION_ID}`;
}

/** @deprecated Identity verification is inline on Profile — use profileIdentitySectionHref */
export function identityVerificationFlowHref(returnTo: string = MY_COMMUNITIES_RETURN): string {
  return profileIdentitySectionHref(returnTo);
}

/** @deprecated use profileIdentitySectionHref or identityVerificationFlowHref */
export function identityVerificationHref(returnTo: string = MY_COMMUNITIES_RETURN): string {
  return profileIdentitySectionHref(returnTo);
}
