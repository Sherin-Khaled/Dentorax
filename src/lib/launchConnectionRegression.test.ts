import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import test from "node:test";
import { getBrandLogoCandidates } from "./brandLogoSources.ts";

const read = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

const categoriesPage = read("../pages/categories.tsx");
const homePage = read("../pages/home.tsx");
const catalogController = read("../../server/src/controllers/catalog.controller.js");
const english = JSON.parse(read("../locales/en.json"));
const arabic = JSON.parse(read("../locales/ar.json"));

test("all 17 top-level categories have explicit audited mappings and approved assets resolve with encoded folder URLs", () => {
  const illustrationDirectory = new URL("../../public/categories page/", import.meta.url);
  const assets = readdirSync(illustrationDirectory).filter((name) => name.endsWith(".svg"));
  assert.equal(assets.length, 19);
  assert.equal(assets.includes("Disposables.svg"), true);
  assert.match(categoriesPage, /const CAT_IMG_BASE = `\$\{import\.meta\.env\.BASE_URL\}categories%20page\/`/);
  for (const slug of [
    "online-courses", "disposable-materials", "books", "restorative",
    "endodontics", "prosthodontics", "perio-surgery", "orthodontics",
    "consumables", "instruments", "equipments", "implant", "dental-lab",
    "bleaching", "burs-stones", "pedodontics", "oral-care-system",
  ]) {
    assert.equal(
      categoriesPage.includes(`  "${slug}":`) || categoriesPage.includes(`  ${slug}:`),
      true,
      `missing explicit top-level category mapping for ${slug}`
    );
  }
  assert.match(categoriesPage, /"disposable-materials":\s*`\$\{CAT_IMG_BASE\}Disposables\.svg`/);
  for (const asset of assets) assert.equal(existsSync(new URL(asset, illustrationDirectory)), true);
});

test("brand logos fall through from an imported URL to the approved slug-named local asset", () => {
  assert.deepEqual(
    getBrandLogoCandidates(
      { slug: "mr-chem", logoUrl: "https://logos.example/mr-chem.png" },
      "/shop/"
    ),
    [
      "https://logos.example/mr-chem.png",
      "/shop/brand-logos/mr-chem.webp",
    ]
  );
  assert.deepEqual(
    getBrandLogoCandidates({ slug: "hexa-dental", logoUrl: null }),
    ["/brand-logos/hexa.webp"]
  );
  assert.match(catalogController, /filter\(\(brand\) => brand\.status !== "INACTIVE"\)/);
  assert.deepEqual(
    getBrandLogoCandidates({ slug: "a-s-instruments", logoUrl: null }),
    ["/brand-logos/a-s-instruments.webp"]
  );
});

test("Home keeps all merchandising sections and uses collection-specific bilingual empty states", () => {
  for (const field of ["isWeeklyOffer", "bestPrices", "isFastDelivery"]) {
    assert.match(homePage, new RegExp(`fetchPublicProducts\\(\\{ ${field}: true`));
  }
  assert.match(catalogController, /salePrice:\s*\{ not: null \}/);
  assert.doesNotMatch(homePage, /t\("products\.noProductsBody"\)/);
  for (const key of ["weeklyEmpty", "bestSellersEmpty", "fastDeliveryEmpty"]) {
    assert.equal(typeof english.home.sections[key], "string");
    assert.equal(typeof arabic.home.sections[key], "string");
  }
});

test("the first sign-in click is a single authoritative login request protected from stale auth initialization", () => {
  const store = read("../context/StoreContext.tsx");
  const login = read("../pages/login.tsx");
  assert.match(store, /const requestId = \+\+authRequestId\.current;[\s\S]*await loginUser\(normalizeEmail\(email\), password\)/);
  assert.match(store, /if \(authRequestId\.current === requestId\) \{[\s\S]*setCurrentUser\(authenticatedUser\)/);
  assert.match(login, /if \(isSubmitting\) return;/);
  assert.equal((store.match(/await loginUser\(/g) ?? []).length, 1);
});
