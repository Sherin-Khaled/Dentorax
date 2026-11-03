import assert from "node:assert/strict";
import test from "node:test";
import { findRedirectTarget, loadDisplayGroup, shapeDisplayGroup } from "./productDisplayGroup.service.js";

const row = (id, extra = {}) => ({
  groupId: "g1",
  displayName: "Family",
  id,
  sku: `SKU-${id}`,
  slug: `slug-${id}`,
  name: `Name ${id}`,
  nameAr: null,
  price: "100.00",
  salePrice: null,
  stockQuantity: 5,
  status: "ACTIVE",
  isAvailable: true,
  ...extra,
});

test("each member keeps its own SKU, price, sale and stock state", () => {
  const group = shapeDisplayGroup(
    [row("a", { salePrice: "80.00" }), row("b", { price: "120.50", status: "OUT_OF_STOCK" }), row("c", { stockQuantity: 0 })],
    [{ productId: "a", type: "SIZE", valueEn: "Small", valueAr: null }]
  );
  assert.deepEqual(group.members.map((member) => [member.sku, member.price, member.salePrice, member.isAvailable]), [
    ["SKU-a", 100, 80, true],
    ["SKU-b", 120.5, null, false],
    ["SKU-c", 100, null, false],
  ]);
  assert.deepEqual(group.members[0].displayAttributes, [{ type: "SIZE", valueEn: "Small", valueAr: null }]);
  assert.deepEqual(group.members[1].displayAttributes, []);
});

test("a group with fewer than two public members has no selector", () => {
  assert.equal(shapeDisplayGroup([row("a")], []), null);
});

test("flash pricing of a member is respected", () => {
  const group = shapeDisplayGroup([row("a"), row("b")], [], new Map([["a", { basePrice: 100, salePrice: 60 }]]));
  assert.equal(group.members[0].salePrice, 60);
  assert.equal(group.members[1].salePrice, null);
});

test("a query failure never breaks the product page", async () => {
  const failing = { $queryRawUnsafe: async () => { throw new Error("missing table"); } };
  assert.equal(await loadDisplayGroup(failing, "a", async () => new Map()), null);
  assert.equal(await findRedirectTarget(failing, "old-slug"), null);
});

test("a redirect resolves only to a returned public product", async () => {
  assert.equal(await findRedirectTarget({ $queryRawUnsafe: async () => [{ id: "target" }] }, "old-slug"), "target");
  assert.equal(await findRedirectTarget({ $queryRawUnsafe: async () => [] }, "old-slug"), null);
});
