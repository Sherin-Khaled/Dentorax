import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (relativePath: string) =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

const oldPublicBrand = /\bX[ -]Dental(?: Store)?\b/i;

function stringValues(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(stringValues);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(stringValues);
  }
  return [];
}

test("customer-facing brand surfaces use Dentorax", () => {
  const sources = [
    read("../components/dental/BrandLogo.tsx"),
    read("../components/dental/ContactNewsletterSection.tsx"),
    read("../pages/admin/_components/AdminLayout.tsx"),
    read("../../index.html"),
    read("../../server/src/services/emailTemplates.js"),
    read("../../server/src/services/supportAcknowledgement.service.js"),
  ];
  const localeValues = ["en", "ar"].flatMap((locale) =>
    stringValues(JSON.parse(read(`../locales/${locale}.json`))),
  );

  for (const source of [...sources, ...localeValues]) {
    assert.doesNotMatch(source, oldPublicBrand);
  }
  assert.ok(sources.every((source) => source.includes("Dentorax")));
  assert.ok(localeValues.some((value) => value.includes("Dentorax")));
});

test("the public rebrand preserves compatibility identifiers and existing URLs", () => {
  const documentSource = read("../../index.html");
  const themeSource = read("../context/ThemeContext.tsx");
  const skuSource = read(
    "../../server/src/scripts/productImageImport/productImageImport.js",
  );

  assert.match(documentSource, /https:\/\/xdentalstore\.com\//);
  assert.match(documentSource, /xdental\.theme/);
  assert.match(themeSource, /xdental\.theme/);
  assert.match(skuSource, /XD-TP-204125/);
});
