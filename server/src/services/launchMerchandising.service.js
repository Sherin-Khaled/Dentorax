export const EQUIPMENT_ROOT_SLUGS = new Set(["equipment", "equipments"]);

// Reviewed exceptions for machine/device products that are currently filed
// outside the Equipment taxonomy. Keep this list deliberately narrow: product
// accessories, sleeves, books, unit-dose materials, and ordinary supplies are
// not excluded merely because their names mention a device.
export const FAST_DELIVERY_EXCLUDED_PRODUCT_SKUS = new Set([
  "XD-TP-102774", "XD-TP-105165", "XD-TP-109072", "XD-TP-111683",
  "XD-TP-112295", "XD-TP-118186", "XD-TP-131334", "XD-TP-135772",
  "XD-TP-147771", "XD-TP-147775", "XD-TP-148571", "XD-TP-153598",
  "XD-TP-156313", "XD-TP-156950", "XD-TP-157891", "XD-TP-157893",
  "XD-TP-157894", "XD-TP-172524", "XD-TP-173227", "XD-TP-173663",
  "XD-TP-173974", "XD-TP-175035", "XD-TP-178265", "XD-TP-183828",
  "XD-TP-183830", "XD-TP-183832", "XD-TP-186475", "XD-TP-186535",
  "XD-TP-186557", "XD-TP-186567", "XD-TP-186662", "XD-TP-188550",
  "XD-TP-188718", "XD-TP-191782", "XD-TP-196116", "XD-TP-197906",
  "XD-TP-197912", "XD-TP-198278", "XD-TP-199144", "XD-TP-199556",
  "XD-TP-199767", "XD-TP-200648", "XD-TP-202519", "XD-TP-202520",
  "XD-TP-202956", "XD-TP-203663", "XD-TP-204229", "XD-TP-204249",
  "XD-TP-205104", "XD-TP-205800", "XD-TP-206264", "XD-TP-206265",
  "XD-TP-206266", "XD-TP-206267", "XD-TP-206268", "XD-TP-206901",
  "XD-TP-206902", "XD-TP-206909", "XD-TP-206994", "XD-TP-207416",
  "XD-TP-33102", "XD-TP-33125", "XD-TP-33133", "XD-TP-56333",
  "XD-TP-56339", "XD-TP-65287", "XD-TP-65340", "XD-TP-69699",
  "XD-TP-77401", "XD-TP-89089",
]);

export function collectCategoryDescendantIds(categories, rootSlugs = EQUIPMENT_ROOT_SLUGS) {
  const childrenByParentId = new Map();
  for (const category of categories) {
    const children = childrenByParentId.get(category.parentId ?? null) ?? [];
    children.push(category);
    childrenByParentId.set(category.parentId ?? null, children);
  }

  const ids = new Set();
  function visit(category) {
    if (ids.has(category.id)) return;
    ids.add(category.id);
    for (const child of childrenByParentId.get(category.id) ?? []) visit(child);
  }
  for (const category of categories) {
    if (rootSlugs.has(category.slug.trim().toLowerCase())) visit(category);
  }
  return ids;
}

export function buildFastDeliveryWhere(excludedCategoryIds) {
  return {
    purchaseMode: "STANDARD",
    isAvailable: true,
    status: { in: ["ACTIVE", "LOW_STOCK"] },
    categoryId: { not: null, notIn: [...excludedCategoryIds] },
    sku: { notIn: [...FAST_DELIVERY_EXCLUDED_PRODUCT_SKUS] },
    OR: [
      {
        variants: { none: {} },
        OR: [{ stockQuantity: null }, { stockQuantity: { gt: 0 } }],
      },
      {
        variants: {
          some: {
            isAvailable: true,
            status: { in: ["ACTIVE", "LOW_STOCK"] },
            stockQuantity: { gt: 0 },
          },
        },
      },
    ],
  };
}

export function isValidBestPriceProduct(product) {
  const price = Number(product?.price);
  const salePrice = Number(product?.salePrice);
  return product?.purchaseMode === "STANDARD"
    && product?.isAvailable === true
    && ["ACTIVE", "LOW_STOCK"].includes(product?.status)
    && Number.isFinite(price)
    && Number.isFinite(salePrice)
    && price > 0
    && salePrice > 0
    && salePrice < price;
}

export function bestPriceMetrics(product) {
  const price = Number(product.price);
  const salePrice = Number(product.salePrice);
  const saving = price - salePrice;
  return { price, salePrice, saving, discountPercentage: saving / price };
}

export function rankBestPriceProducts(products) {
  return products
    .filter(isValidBestPriceProduct)
    .sort((left, right) => {
      const leftMetrics = bestPriceMetrics(left);
      const rightMetrics = bestPriceMetrics(right);
      return rightMetrics.discountPercentage - leftMetrics.discountPercentage
        || rightMetrics.saving - leftMetrics.saving
        || String(left.sku ?? left.id).localeCompare(String(right.sku ?? right.id))
        || String(left.id).localeCompare(String(right.id));
    });
}

export function isFastDeliveryProductRecord(product, excludedCategoryIds) {
  const hasStock = product.stockQuantity === null || Number(product.stockQuantity) > 0;
  return product.purchaseMode === "STANDARD"
    && product.isAvailable === true
    && ["ACTIVE", "LOW_STOCK"].includes(product.status)
    && Boolean(product.categoryId)
    && !excludedCategoryIds.has(product.categoryId)
    && !FAST_DELIVERY_EXCLUDED_PRODUCT_SKUS.has(product.sku)
    && hasStock;
}
