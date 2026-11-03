import assert from "node:assert/strict";
import test from "node:test";
import { deriveDisplayGroupChoices } from "./displayGroupOptions.ts";
import type { ProductDisplayGroupMember } from "../types/product.ts";

const member = (id: string, name: string, attrs: [string, string, string?][] = [], extra: Partial<ProductDisplayGroupMember> = {}): ProductDisplayGroupMember => ({
  productId: id,
  sku: id,
  slug: `slug-${id}`,
  name,
  nameAr: null,
  price: 10,
  salePrice: null,
  isAvailable: true,
  displayAttributes: attrs.map(([type, valueEn, valueAr]) => ({ type, valueEn, valueAr: valueAr ?? null })),
  ...extra,
});

const labels = (members: ProductDisplayGroupMember[], language = "en") => deriveDisplayGroupChoices(members, language).map((choice) => choice.label);

test("uses the attribute that varies and ignores one that is shared", () => {
  assert.deepEqual(labels([member("a", "Glove Small", [["SIZE", "Small"], ["PACKAGE_COUNT", "100 Pcs"]]), member("b", "Glove Large", [["SIZE", "Large"], ["PACKAGE_COUNT", "100 Pcs"]])]), ["Large", "Small"]);
});

test("uses Arabic attribute values on Arabic pages", () => {
  assert.deepEqual(labels([member("a", "Pen Blue", [["COLOR", "Blue", "أزرق"]]), member("b", "Pen Red", [["COLOR", "Red", "أحمر"]])], "ar").sort(), ["أحمر", "أزرق"].sort());
});

test("falls back to what differs in the names when attributes are shared", () => {
  assert.deepEqual(labels([member("a", "Irrisafe Tip #20 - 21mm", [["PACKAGE_COUNT", "4 Pcs"]]), member("b", "Irrisafe Tip #20 - 25 mm", [["PACKAGE_COUNT", "4 Pcs"]])]), ["21mm", "25 mm"]);
});

test("removes shared words from both ends and sorts numerically", () => {
  assert.deepEqual(labels([member("a", "Closed Spring 12 mm Steel"), member("b", "Closed Spring 9 mm Steel"), member("c", "Closed Spring 100 mm Steel")]), ["9 mm", "12 mm", "100 mm"]);
  assert.deepEqual(labels([member("a", "Closed Spring 12 mm"), member("b", "Closed Spring 9 mm")]), ["9 mm", "12 mm"]);
  assert.deepEqual(labels([member("a", "Coil Blue Large"), member("b", "Coil Red Large")]), ["Blue", "Red"]);
});

test("does not use an attribute that only some members carry", () => {
  assert.deepEqual(labels([member("a", "Film Mount 1 Pc"), member("b", "Film Mount 100 Pcs", [["PACKAGE_COUNT", "100 Pcs"]])]), ["1 Pc", "100 Pcs"]);
});

test("shows no selector for members that cannot be told apart", () => {
  assert.deepEqual(labels([member("a", "Composite A2"), member("b", "Composite A2")]), []);
  assert.deepEqual(labels([member("a", "Tip 21mm"), member("b", "Tip 21 mm")]), []);
  assert.deepEqual(labels([member("a", "Tip"), member("b", "Tip Plus")]), []);
  assert.deepEqual(labels([member("a", "Only one")]), []);
});

test("each choice stays the member's own product and availability", () => {
  const choices = deriveDisplayGroupChoices([member("a", "Tip 1", [], { isAvailable: false }), member("b", "Tip 2")], "en");
  assert.deepEqual(choices, [
    { productId: "a", slug: "slug-a", label: "1", isAvailable: false },
    { productId: "b", slug: "slug-b", label: "2", isAvailable: true },
  ]);
});
