import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const readSource = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

const categories = readSource("../pages/categories.tsx");
const about = readSource("../pages/about.tsx");
const timelineMedia = readSource("../components/dental/TimelineMedia.tsx");
const recordingCursor = readSource("../components/dental/RecordingCursor.tsx");
const app = readSource("../App.tsx");
const styles = readSource("../index.css");
const english = JSON.parse(readSource("../locales/en.json"));
const arabic = JSON.parse(readSource("../locales/ar.json"));

test("Categories Step 2 remains the finalized Supply Lists feature in EN and AR", () => {
  const englishSteps = english.categoriesPage.workflow.steps;
  const arabicSteps = arabic.categoriesPage.workflow.steps;

  assert.equal(englishSteps.step1.title, "We're Here When You Need Us");
  assert.equal(englishSteps.step2.title, "Save to Supply Lists");
  assert.equal(
    englishSteps.step2.description,
    "Save frequently used products into reusable supply lists for faster reordering and easier clinic purchasing."
  );
  assert.equal(englishSteps.step3.title, "Earn Rewards as You Shop");
  assert.doesNotMatch(englishSteps.step3.description, /sign.?up|welcome|5,000/i);
  assert.equal(englishSteps.step4.title, "Checkout & Track Orders");
  assert.equal(arabicSteps.step2.title, "احفظ في قوائم التوريد");
  assert.doesNotMatch(englishSteps.step2.title, /Clinic Branches|Clinic Locations/);
});

test("About timeline uses the four approved non-duplicative clinic workflows and real routes", () => {
  const englishSteps = english.aboutPage.workflow.steps;
  const arabicSteps = arabic.aboutPage.workflow.steps;

  assert.deepEqual(Object.keys(englishSteps), ["clinicBranches", "freeDelivery", "quotes", "productRequest"]);
  assert.equal(englishSteps.clinicBranches.title, "Manage Your Clinic Branches");
  assert.equal(englishSteps.freeDelivery.title, "Free Delivery Days");
  assert.equal(englishSteps.quotes.title, "Request a Custom Quote");
  assert.equal(englishSteps.productRequest.title, "Can't Find It? Request It");
  assert.equal(arabicSteps.clinicBranches.title, "إدارة فروع عيادتك");
  assert.equal(arabicSteps.freeDelivery.title, "أيام التوصيل المجاني");
  assert.equal(arabicSteps.quotes.title, "اطلب عرض سعر مخصصًا");
  assert.equal(arabicSteps.productRequest.title, "لم تجده؟ اطلبه");
  for (const route of [
    "/account/clinic-branches",
    "/shipping-delivery",
    "/account/quotes",
    "/account/product-requests",
  ]) assert.match(about, new RegExp(route));
  assert.doesNotMatch(about, /id: "wishlist"|id: "supplyLists"|id: "productSupport"/);
});

test("Categories and About timelines share the requested responsive title scale", () => {
  for (const source of [categories, about]) {
    assert.match(source, /text-\[30px\].*sm:text-\[36px\]/);
    assert.match(source, /text-\[clamp\(2rem,2\.5vw,2\.75rem\)\]/);
  }
});

test("Step 3 renders a dominant gold primary CTA and a restrained secondary CTA", () => {
  assert.match(categories, /label: "walletLink", hierarchy: "primary"/);
  assert.match(categories, /label: "checkoutLink", hierarchy: "secondary"/);
  assert.match(categories, /xd-gradient-gold inline-flex/);
  assert.match(categories, /border-\[var\(--xd-gold-border\)\] bg-white\/75/);
});

test("timeline media supports stable image and reduced-motion-aware video rendering", () => {
  assert.match(timelineMedia, /type: "image"/);
  assert.match(timelineMedia, /type: "video"/);
  assert.match(timelineMedia, /poster=\{source\.poster\}/);
  assert.match(timelineMedia, /muted/);
  assert.match(timelineMedia, /autoPlay=\{!prefersReducedMotion\}/);
  assert.match(timelineMedia, /loop=\{!prefersReducedMotion\}/);
  assert.match(timelineMedia, /playsInline/);
  assert.match(timelineMedia, /controls=\{false\}/);
  assert.match(categories, /aspect-\[3\/2\]/);
  assert.match(about, /aspect-\[3\/2\]/);
});

test("recording cursor is query-gated, pointer-safe, interactive-aware, and cleaned up", () => {
  assert.match(recordingCursor, /get\("recording"\) === "1"/);
  assert.match(recordingCursor, /\(pointer: fine\) and \(hover: hover\)/);
  assert.match(recordingCursor, /requestAnimationFrame/);
  assert.match(recordingCursor, /event\.clientX/);
  assert.match(recordingCursor, /event\.clientY/);
  assert.match(recordingCursor, /target\.closest\(INTERACTIVE_SELECTOR\)/);
  assert.match(recordingCursor, /removeEventListener\("pointermove"/);
  assert.match(recordingCursor, /classList\.remove\("xd-recording-cursor-active"\)/);
  assert.match(app, /<RecordingCursor \/>/);
  assert.match(styles, /pointer-events: none/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});
