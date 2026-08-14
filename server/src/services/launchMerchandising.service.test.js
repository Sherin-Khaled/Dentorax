import assert from "node:assert/strict";
import test from "node:test";
import {
  FAST_DELIVERY_EXCLUDED_PRODUCT_SKUS,
  bestPriceMetrics,
  buildFastDeliveryWhere,
  collectCategoryDescendantIds,
  rankBestPriceProducts,
} from "./launchMerchandising.service.js";

test("Best Prices ranks genuine STANDARD catalogue savings by percentage, EGP saving, then stable SKU", () => {
  const base = { purchaseMode: "STANDARD", isAvailable: true, status: "ACTIVE" };
  const ranked = rankBestPriceProducts([
    { ...base, id: "3", sku: "SKU-C", price: 200, salePrice: 100 },
    { ...base, id: "2", sku: "SKU-B", price: 100, salePrice: 50 },
    { ...base, id: "1", sku: "SKU-A", price: 100, salePrice: 50 },
    { ...base, id: "4", sku: "SKU-D", price: 100, salePrice: null },
    { ...base, id: "5", sku: "SKU-E", price: 100, salePrice: 100 },
    { ...base, id: "6", sku: "SKU-F", price: 100, salePrice: 40, purchaseMode: "QUOTE" },
  ]);
  assert.deepEqual(ranked.map((product) => product.sku), ["SKU-C", "SKU-A", "SKU-B"]);
  assert.deepEqual(bestPriceMetrics(ranked[0]), {
    price: 200,
    salePrice: 100,
    saving: 100,
    discountPercentage: 0.5,
  });
});

test("Fast Delivery excludes the Equipment root and every descendant through taxonomy ancestry", () => {
  const categories = [
    { id: "materials", slug: "consumables", parentId: null },
    { id: "equipment", slug: "equipments", parentId: null },
    { id: "scanner", slug: "scanner", parentId: "equipment" },
    { id: "sensor", slug: "sensor", parentId: "scanner" },
  ];
  const ids = collectCategoryDescendantIds(categories);
  assert.deepEqual([...ids], ["equipment", "scanner", "sensor"]);
  const where = buildFastDeliveryWhere(ids);
  assert.deepEqual(where.categoryId, { not: null, notIn: ["equipment", "scanner", "sensor"] });
  assert.equal(where.purchaseMode, "STANDARD");
  assert.equal(where.isAvailable, true);
});

test("Fast Delivery's reviewed exception list excludes known machines outside Equipment without broad text matching", () => {
  assert.equal(FAST_DELIVERY_EXCLUDED_PRODUCT_SKUS.has("XD-TP-105165"), true);
  assert.equal(FAST_DELIVERY_EXCLUDED_PRODUCT_SKUS.has("XD-TP-175035"), true);
  assert.equal(FAST_DELIVERY_EXCLUDED_PRODUCT_SKUS.has("XD-TP-204679"), false);
  assert.equal(FAST_DELIVERY_EXCLUDED_PRODUCT_SKUS.has("XD-TP-206553"), false);
});
