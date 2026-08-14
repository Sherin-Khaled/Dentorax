import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

const languageContext = read("../context/LanguageContext.tsx");
const themeContext = read("../context/ThemeContext.tsx");
const html = read("../../index.html");
const footer = read("../components/dental/Footer.tsx");
const products = read("../pages/products.tsx");
const styles = read("../index.css");
const robots = read("../../public/robots.txt");
const sitemap = read("../../public/sitemap.xml");
const productDetail = read("../pages/product-detail.tsx");
const migration = read(
  "../../server/prisma/migrations/20260813120000_add_product_merchandising_purchase_mode/migration.sql"
);
const productionSeedExport = read(
  "../../server/src/scripts/productionMigration/exportProductionSeed.mjs"
);

test("language dictionaries are split into lazy chunks instead of both entering the initial bundle", () => {
  assert.match(languageContext, /import\("@\/locales\/en\.json"\)/);
  assert.match(languageContext, /import\("@\/locales\/ar\.json"\)/);
  assert.doesNotMatch(languageContext, /import en from/);
  assert.doesNotMatch(languageContext, /import ar from/);
});

test("new visitors start in English and light mode while stored preferences remain respected", () => {
  assert.match(languageContext, /return isLanguage\(stored\) \? stored : "en"/);
  assert.match(themeContext, /if \(storedTheme\) return storedTheme/);
  assert.doesNotMatch(themeContext, /prefers-color-scheme/);
  assert.match(html, /\? storedTheme\s*:\s*"light"/);
  assert.doesNotMatch(html, /prefers-color-scheme/);
});

test("launch footer uses the approved support phone, public email, and canonical address", () => {
  assert.match(footer, /tel:\+201552229405/);
  assert.match(footer, /mailto:contact@dentora-x\.com/);
  assert.match(footer, /footer\.contact\.addressValue/);
  assert.doesNotMatch(footer, /01065057035|wa\.me\/201035777335/);
});

test("wide product layout uses four cards with a compact filter sidebar", () => {
  assert.match(products, /w-\[240px\].*xl:w-\[250px\]/);
  assert.match(styles, /@media \(min-width: 1280px\)[\s\S]*?products-grid--with-filters[\s\S]*?repeat\(4,/);
});

test("default social metadata references a real public asset and contains no invented inventory claims", () => {
  assert.match(html, /\/favicon\.webp/);
  assert.doesNotMatch(html, /og-image\.jpg|opengraph\.jpg/);
  assert.doesNotMatch(html, /1,200\+|500\+|50\+/);
  assert.equal(existsSync(new URL("../../public/favicon.webp", import.meta.url)), true);
});

test("robots and sitemap keep private or transactional routes out of search", () => {
  for (const path of ["/account", "/admin", "/cart", "/checkout", "/login", "/signup"]) {
    assert.match(robots, new RegExp(`Disallow: ${path.replace("/", "\\/")}(?:\\s|$)`));
    assert.doesNotMatch(sitemap, new RegExp(`<loc>[^<]*${path.replace("/", "\\/")}(?:/|<)`));
  }
});

test("product pages publish Product and BreadcrumbList structured data", () => {
  assert.match(productDetail, /"@type": "Product"/);
  assert.match(productDetail, /"@type": "BreadcrumbList"/);
  assert.match(productDetail, /purchaseMode === "STANDARD"/);
});

test("merchandising migration is additive and preserves existing product rows", () => {
  for (const field of [
    "isWeeklyOffer",
    "isBestSeller",
    "isNewArrival",
    "isHotDeal",
    "isFastDelivery",
    "purchaseMode",
  ]) {
    assert.match(migration, new RegExp(field));
  }
  assert.doesNotMatch(migration, /\b(?:DROP|TRUNCATE|DELETE)\b/i);
});

test("production catalogue export carries every merchandising and purchase-mode field", () => {
  for (const field of [
    "isWeeklyOffer",
    "isBestSeller",
    "isNewArrival",
    "isHotDeal",
    "isFastDelivery",
    "purchaseMode",
  ]) {
    assert.match(productionSeedExport, new RegExp(`${field}: true`));
  }
});
