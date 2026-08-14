import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

// Source-inspection tests (this repo has no jsdom/RTL setup — see
// welcomeRewardPresentation.test.ts against checkout.tsx for the established
// pattern of asserting behavior directly against component source).
const source = readFileSync(new URL("./FeatureTourDialog.tsx", import.meta.url), "utf8");

test("builds on the shared accessible Dialog primitive instead of a hand-rolled modal", () => {
  assert.match(source, /from "@\/components\/ui\/dialog"/);
  assert.match(source, /<Dialog open=\{open\} onOpenChange=\{handleOpenChange\}>/);
  assert.match(source, /<DialogTitle/);
  assert.match(source, /<DialogDescription/);
});

test("every dismissal path (skip, finish, Escape/overlay/X) marks the tour completed", () => {
  const markCalls = source.match(/markFeatureTourCompleted\(\);/g) ?? [];
  assert.ok(markCalls.length >= 3, `expected finish/skip/openChange to each call markFeatureTourCompleted, found ${markCalls.length} call sites`);
});

test("clicking a feature CTA closes the tour and navigates to its real route", () => {
  assert.match(source, /const handleCtaClick = \(targetStep: FeatureTourStep\) => \{/);
  assert.match(source, /markFeatureTourCompleted\(\);/);
  assert.match(source, /setOpen\(false\);/);
  assert.match(source, /navigate\(destination\);/);
});

test("account-only CTAs route through the sign-in redirect when the visitor isn't authenticated", () => {
  assert.match(source, /targetStep\.requiresAuth && !isAuthenticated/);
  assert.match(source, /getFeatureTourSignInHref\(targetStep\.ctaHref\)/);
});

test("does not auto-show on excluded paths or before auth state resolves", () => {
  assert.match(source, /isAuthLoading/);
  assert.match(source, /isFeatureTourExcludedPath/);
  assert.match(source, /hasCompletedFeatureTour\(\)/);
});

test("respects RTL: dialog direction, icon direction, and slide offset all key off isRtl", () => {
  assert.match(source, /dir=\{isRtl \? "rtl" : "ltr"\}/);
  assert.match(source, /direction="back"/);
  assert.match(source, /direction="forward"/);
  assert.match(source, /isRtl \? -18 : 18/);
});

test("step content is localized through t(), not hardcoded per-language strings", () => {
  assert.match(source, /t\(step\.titleKey\)/);
  assert.match(source, /t\(step\.descriptionKey\)/);
  assert.match(source, /t\(step\.ctaTextKey\)/);
  assert.doesNotMatch(source, /language === "ar" \?/);
});

test("progress is exposed to assistive tech via a live region, not color/dots alone", () => {
  assert.match(source, /role="status" aria-live="polite"/);
  assert.match(source, /featureTour\.stepCounter/);
});

test("theme comes from CSS custom properties, not a hardcoded light/dark branch", () => {
  assert.match(source, /var\(--xd-surface-strong\)/);
  assert.match(source, /var\(--xd-gold-border-soft\)/);
  assert.doesNotMatch(source, /theme === "dark"/);
});
