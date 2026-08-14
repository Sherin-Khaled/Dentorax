import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { getWelcomeRewardProgress } from "./welcomeRewardPresentation.ts";

const checkoutSource = readFileSync(new URL("../pages/checkout.tsx", import.meta.url), "utf8");
const en = JSON.parse(readFileSync(new URL("../locales/en.json", import.meta.url), "utf8"));
const ar = JSON.parse(readFileSync(new URL("../locales/ar.json", import.meta.url), "utf8"));

test("welcome reward progress reports the actual eligible subtotal below the threshold", () => {
  const progress = getWelcomeRewardProgress(772);
  assert.deepEqual(
    { current: progress.current, target: progress.target, remaining: progress.remaining },
    { current: 772, target: 5_000, remaining: 4_228 }
  );
  assert.ok(Math.abs(progress.percentage - 15.44) < Number.EPSILON * 10);
  assert.equal(getWelcomeRewardProgress(4_999).remaining, 1);
});

test("welcome reward progress unlocks at the threshold and clamps its visual bar", () => {
  assert.deepEqual(getWelcomeRewardProgress(5_000), {
    current: 5_000,
    target: 5_000,
    remaining: 0,
    percentage: 100,
  });
  assert.deepEqual(getWelcomeRewardProgress(5_001), {
    current: 5_001,
    target: 5_000,
    remaining: 0,
    percentage: 100,
  });
});

test("checkout exposes compact locked, eligible, and applied welcome reward states", () => {
  assert.match(checkoutSource, /data-state=\{welcomeRewardApplied \? "applied" : trustedTotals\?\.welcomePointsEligible \? "eligible" : "locked"\}/);
  assert.match(checkoutSource, /flex flex-col gap-4 md:flex-row/);
  assert.match(checkoutSource, /role="progressbar"/);
  assert.match(checkoutSource, /min-h-11 w-full/);
  assert.match(checkoutSource, /rewardApplied/);
  assert.doesNotMatch(checkoutSource, /welcome-reward-panel[\s\S]{0,300}X/);
});

test("welcome reward action and status copy is localized in English and Arabic", () => {
  for (const locale of [en, ar]) {
    const rewards = locale.checkout.rewards;
    for (const key of ["unlockWelcome", "welcomeReady", "welcomeLockedRemaining", "saveAmount", "rewardApplied", "amountSaved"]) {
      assert.equal(typeof rewards[key], "string");
      assert.ok(rewards[key].length > 0);
    }
  }
});
