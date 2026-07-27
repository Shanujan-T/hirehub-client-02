/** Query param carrying the full return path (path + search) for back navigation. */
export const RETURN_TO = "returnTo";

const SCROLL_PREFIX = "list-scroll:";
const DRAFT_PREFIX = "draft-selection:";

export function listKeyFromPath(pathname: string, search = ""): string {
  return `${pathname}${search}`;
}

export function appendReturnTo(href: string, returnTo: string): string {
  const [path, existingQuery = ""] = href.split("?");
  const params = new URLSearchParams(existingQuery);
  params.set(RETURN_TO, returnTo);
  const q = params.toString();
  return q ? `${path}?${q}` : path;
}

export function getReturnToParam(
  searchParams: URLSearchParams | ReadonlyURLSearchParams | null,
  fallback: string
): string {
  const value = searchParams?.get(RETURN_TO);
  if (!value) return fallback;
  try {
    const decoded = decodeURIComponent(value);
    if (decoded.startsWith("/")) return decoded;
  } catch {
    /* ignore malformed values */
  }
  return fallback;
}

type ReadonlyURLSearchParams = Pick<URLSearchParams, "get">;

export function saveListScroll(listKey: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(`${SCROLL_PREFIX}${listKey}`, String(window.scrollY));
}

export function restoreListScroll(listKey: string) {
  if (typeof window === "undefined") return;
  const raw = sessionStorage.getItem(`${SCROLL_PREFIX}${listKey}`);
  if (raw == null) return;
  const y = Number(raw);
  requestAnimationFrame(() => window.scrollTo(0, y));
}

export function saveDraftSelection(key: string, value: string | number | null) {
  if (typeof window === "undefined") return;
  const storageKey = `${DRAFT_PREFIX}${key}`;
  if (value == null) sessionStorage.removeItem(storageKey);
  else sessionStorage.setItem(storageKey, String(value));
}

export function loadDraftSelection(key: string): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(`${DRAFT_PREFIX}${key}`);
}

export function buildFilteredPath(
  pathname: string,
  filters: Record<string, string | undefined | null>
): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([k, v]) => {
    if (v) params.set(k, v);
  });
  const q = params.toString();
  return q ? `${pathname}?${q}` : pathname;
}

/** Multi-step flow helper (e.g. handover). Each step links back to the prior step URL. */
export function handoverStepHref(stepPath: string, previousStepUrl: string): string {
  return appendReturnTo(stepPath, previousStepUrl);
}
