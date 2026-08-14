// Bump this to show a new tour to everyone again (e.g. "v2") without
// touching the storage-key logic below.
export const FEATURE_TOUR_VERSION = "v1";

export function getFeatureTourStorageKey(version: string = FEATURE_TOUR_VERSION) {
  return `dentorax_feature_tour_completed_${version}`;
}

export const FEATURE_TOUR_STORAGE_KEY = getFeatureTourStorageKey();

export const FEATURE_TOUR_EXCLUDED_PATH_PREFIXES = [
  "/signin",
  "/login",
  "/signup",
  "/checkout",
  "/order-confirmed",
  "/admin",
] as const;

export function isFeatureTourExcludedPath(pathname: string) {
  return FEATURE_TOUR_EXCLUDED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

// Mirrors App.tsx's getSignInPath so an unauthenticated visitor who clicks
// an account-only CTA lands back on that same destination after signing in.
export function getFeatureTourSignInHref(targetPath: string) {
  return `/signin?redirect=${encodeURIComponent(targetPath)}`;
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function getStorage(storage?: StorageLike): StorageLike | null {
  if (storage) return storage;
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function hasCompletedFeatureTour(storage?: StorageLike): boolean {
  try {
    const target = getStorage(storage);
    return target?.getItem(FEATURE_TOUR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function markFeatureTourCompleted(storage?: StorageLike): void {
  try {
    getStorage(storage)?.setItem(FEATURE_TOUR_STORAGE_KEY, "true");
  } catch {
    // Tour still closes/finishes normally when storage is unavailable.
  }
}

export type FeatureTourEvent =
  | { type: "shown" }
  | { type: "skipped"; atStepId: string }
  | { type: "completed" }
  | { type: "cta_clicked"; stepId: string; href: string };

// Every dismissal path funnels through this single dispatcher so an
// analytics provider can be wired in later by replacing this one function.
export function reportFeatureTourEvent(event: FeatureTourEvent): void {
  if (typeof window === "undefined") return;
  const detail = event;
  window.dispatchEvent(new CustomEvent<FeatureTourEvent>("dentorax:feature-tour", { detail }));
}
