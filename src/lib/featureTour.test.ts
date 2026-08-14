import assert from "node:assert/strict";
import test from "node:test";
import {
  FEATURE_TOUR_STORAGE_KEY,
  FEATURE_TOUR_VERSION,
  getFeatureTourSignInHref,
  getFeatureTourStorageKey,
  hasCompletedFeatureTour,
  isFeatureTourExcludedPath,
  markFeatureTourCompleted,
} from "./featureTour.ts";

type MockStorage = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

function createMockStorage(): MockStorage {
  const store = new Map<string, string>();
  return {
    getItem: (key) => (store.has(key) ? store.get(key)! : null),
    setItem: (key, value) => {
      store.set(key, value);
    },
  };
}

test("storage key is versioned and matches the documented dentorax_feature_tour_completed_v1 convention", () => {
  assert.equal(FEATURE_TOUR_VERSION, "v1");
  assert.equal(FEATURE_TOUR_STORAGE_KEY, "dentorax_feature_tour_completed_v1");
  assert.equal(getFeatureTourStorageKey("v2"), "dentorax_feature_tour_completed_v2");
});

test("a fresh visitor has not completed the tour", () => {
  const storage = createMockStorage();
  assert.equal(hasCompletedFeatureTour(storage), false);
});

test("marking the tour completed persists it for future checks", () => {
  const storage = createMockStorage();
  markFeatureTourCompleted(storage);
  assert.equal(storage.getItem(FEATURE_TOUR_STORAGE_KEY), "true");
  assert.equal(hasCompletedFeatureTour(storage), true);
});

test("storage failures never throw — the tour still behaves as 'not completed'", () => {
  const throwingStorage: MockStorage = {
    getItem: () => {
      throw new Error("storage disabled");
    },
    setItem: () => {
      throw new Error("storage disabled");
    },
  };

  assert.doesNotThrow(() => hasCompletedFeatureTour(throwingStorage));
  assert.equal(hasCompletedFeatureTour(throwingStorage), false);
  assert.doesNotThrow(() => markFeatureTourCompleted(throwingStorage));
});

test("critical transactional and admin routes are excluded from the first-visit tour", () => {
  for (const path of [
    "/checkout",
    "/checkout/review",
    "/signin",
    "/login",
    "/signup",
    "/order-confirmed",
    "/admin",
    "/admin/products",
  ]) {
    assert.equal(isFeatureTourExcludedPath(path), true, `${path} should be excluded`);
  }
});

test("ordinary storefront routes remain eligible for the tour", () => {
  for (const path of [
    "/",
    "/products",
    "/products/123",
    "/shipping-delivery",
    "/account/wallet",
    "/track-order",
  ]) {
    assert.equal(isFeatureTourExcludedPath(path), false, `${path} should be eligible`);
  }
});

test("sign-in redirect preserves the intended account destination", () => {
  assert.equal(
    getFeatureTourSignInHref("/account/wallet"),
    "/signin?redirect=%2Faccount%2Fwallet"
  );
});
