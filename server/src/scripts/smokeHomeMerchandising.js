#!/usr/bin/env node
import "dotenv/config";
import { createApp } from "../app.js";
import { connectDatabase, disconnectDatabase } from "../config/db.js";
import { listenForRequests } from "../serverRuntime.js";

let server;

async function getJson(baseUrl, path) {
  const response = await fetch(`${baseUrl}${path}`);
  if (!response.ok) {
    throw new Error(`${path}: expected HTTP 200, received ${response.status}.`);
  }
  return response.json();
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  await connectDatabase();
  server = await listenForRequests(createApp(), 0);
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}/api`;

  const [weekly, best, fast, brands, categories] = await Promise.all([
    getJson(baseUrl, "/products?isWeeklyOffer=true&limit=12"),
    getJson(baseUrl, "/products?bestPrices=true&limit=12"),
    getJson(baseUrl, "/products?isFastDelivery=true&limit=12"),
    getJson(baseUrl, "/brands"),
    getJson(baseUrl, "/categories/tree"),
  ]);

  assert(weekly.pagination.total === 2293, `weekly offers: expected 2293, received ${weekly.pagination.total}`);
  assert(weekly.products.length === 12, `weekly offers: expected a full first page, received ${weekly.products.length}`);
  assert(
    weekly.products.every((product) => product.isWeeklyOffer && product.salePrice > 0 && product.salePrice < product.basePrice),
    "weekly offers: every returned product must expose a genuine valid sale price"
  );
  assert(best.pagination.total > 0, "best prices: expected genuine discounted catalogue products");
  assert(best.products.length === 12, `best prices: expected a full first page, received ${best.products.length}`);
  assert(best.products.every((product) => product.salePrice > 0 && product.salePrice < product.basePrice), "best prices: found a product without genuine savings");
  assert(fast.pagination.total > 0, "fast delivery: expected eligible non-equipment STANDARD products");
  assert(fast.products.length === 12, `fast delivery: expected a full first page, received ${fast.products.length}`);
  assert(fast.products.every((product) => product.isFastDelivery && product.purchaseMode === "STANDARD" && product.available), "fast delivery: found an ineligible product");
  assert(brands.brands.length === 607, `brand directory: expected 607 active approved records, received ${brands.brands.length}`);
  assert(brands.brands.some((brand) => brand.slug === "3m" && brand.name === "3M"), "brand directory: 3M is missing");
  assert(categories.categories.length === 17, `category tree: expected 17 top-level categories, received ${categories.categories.length}`);

  console.log(`Home merchandising smoke passed: weekly=2293, bestPrices=${best.pagination.total}, fast=${fast.pagination.total}, directoryBrands=607, top-level categories=17.`);
} finally {
  if (server) await new Promise((resolve) => server.close(resolve));
  await disconnectDatabase();
}
