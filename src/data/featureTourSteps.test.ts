import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

// This suite reads the source as text (rather than importing it) because the
// module pulls in lucide-react icon components, matching how other *.tsx-
// adjacent tests in this repo (e.g. welcomeRewardPresentation.test.ts against
// checkout.tsx) verify React-facing modules without a bundler/jsdom.
const source = readFileSync(new URL("./featureTourSteps.ts", import.meta.url), "utf8");
const appSource = readFileSync(new URL("../App.tsx", import.meta.url), "utf8");
const en = JSON.parse(readFileSync(new URL("../locales/en.json", import.meta.url), "utf8"));
const ar = JSON.parse(readFileSync(new URL("../locales/ar.json", import.meta.url), "utf8"));

type Json = Record<string, unknown>;

function getNested(tree: Json, key: string): unknown {
  return key.split(".").reduce<unknown>((current, segment) => {
    if (!current || typeof current !== "object") return undefined;
    return (current as Json)[segment];
  }, tree);
}

const stepBlocks = [...source.matchAll(/\{\s*id:\s*"(\w+)",([\s\S]*?)\n {2}\},/g)].map(
  (match) => ({ id: match[1], body: match[2] })
);

// The routes below were verified against src/App.tsx and each destination
// page's live implementation before being wired into the tour — see the
// research notes in the PR/report. Do not widen this list without the same
// verification pass.
const APPROVED_ROUTES = [
  "/shipping-delivery",
  "/how-to-order",
  "/account/wallet",
  "/account/product-requests",
  "/track-order",
  "/account/wishlist",
  "/contact",
];

test("feature tour source defines steps and they were all located", () => {
  assert.ok(stepBlocks.length > 0, "regex failed to locate any step blocks — update the test's pattern");
});

test("tour stays short: intro plus at most 7 feature steps (8 total)", () => {
  assert.ok(stepBlocks.length <= 8, `expected at most 8 steps, found ${stepBlocks.length}`);
});

test("every step id is unique", () => {
  const ids = stepBlocks.map((step) => step.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("every referenced translation key resolves to a non-empty string in English and Arabic", () => {
  for (const { id, body } of stepBlocks) {
    for (const field of ["titleKey", "descriptionKey", "ctaTextKey"]) {
      const match = body.match(new RegExp(`${field}:\\s*"([^"]+)"`));
      if (!match) continue;
      const key = match[1];
      for (const [localeName, tree] of [["en", en] as const, ["ar", ar] as const]) {
        const value = getNested(tree, key);
        assert.equal(typeof value, "string", `${id}.${field} ("${key}") missing from ${localeName}.json`);
        assert.ok((value as string).length > 0, `${id}.${field} ("${key}") is empty in ${localeName}.json`);
      }
    }
  }
});

test("every ctaHref is an approved, verified-real route that actually exists in App.tsx", () => {
  const hrefs = [...source.matchAll(/ctaHref:\s*"([^"]+)"/g)].map((match) => match[1]);
  assert.ok(hrefs.length > 0);

  for (const href of hrefs) {
    assert.ok(APPROVED_ROUTES.includes(href), `${href} is not on the approved feature-tour destination list`);
    const escaped = href.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    assert.match(
      appSource,
      new RegExp(`path="${escaped}"`),
      `${href} is not registered as a live route in App.tsx`
    );
  }
});

test("account-only destinations are under /account and marked requiresAuth (and vice versa)", () => {
  for (const { id, body } of stepBlocks) {
    const hrefMatch = body.match(/ctaHref:\s*"([^"]+)"/);
    if (!hrefMatch) continue;
    const requiresAuth = /requiresAuth:\s*true/.test(body);
    const isAccountRoute = hrefMatch[1].startsWith("/account/");
    assert.equal(
      requiresAuth,
      isAccountRoute,
      `${id} → ${hrefMatch[1]}: requiresAuth flag (${requiresAuth}) must match whether the route is an /account route`
    );
  }
});

test("first step is a pure welcome/intro step with no CTA", () => {
  const first = stepBlocks[0];
  assert.equal(first.id, "welcome");
  assert.doesNotMatch(first.body, /ctaHref:/);
});

test("last step points customers to support, matching the required closing step", () => {
  const last = stepBlocks[stepBlocks.length - 1];
  assert.equal(last.id, "support");
  assert.match(last.body, /ctaHref:\s*"\/contact"/);
});
