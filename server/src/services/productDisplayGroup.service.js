/**
 * Public product page helpers for display groups and retired duplicate URLs.
 * Reads the existing tables directly, so the deployed Prisma schema does not
 * change. Read-only: a member stays a real Product with its own SKU, price,
 * sale, stock, image and URL. A query failure returns nothing, so the product
 * page keeps working without a selector or a redirect.
 */
const PUBLIC_MEMBER_FILTER = `p.status IN ('ACTIVE', 'LOW_STOCK', 'OUT_OF_STOCK') AND p.price IS NOT NULL`;

export function shapeDisplayGroup(rows, attributeRows, pricingByProductId = new Map()) {
  if (rows.length < 2) return null;
  const attributesByProductId = new Map();
  for (const attribute of attributeRows) {
    const list = attributesByProductId.get(attribute.productId) ?? [];
    list.push({ type: attribute.type, valueEn: attribute.valueEn, valueAr: attribute.valueAr ?? null });
    attributesByProductId.set(attribute.productId, list);
  }
  return {
    id: rows[0].groupId,
    displayName: rows[0].displayName,
    members: rows.map((row) => {
      const pricing = pricingByProductId.get(row.id);
      const basePrice = pricing?.basePrice ?? Number(row.price);
      const salePrice = pricing ? pricing.salePrice ?? null : row.salePrice === null ? null : Number(row.salePrice);
      return {
        productId: row.id,
        sku: row.sku ?? null,
        slug: row.slug,
        name: row.name,
        nameAr: row.nameAr ?? null,
        price: basePrice,
        salePrice,
        isAvailable: row.isAvailable && row.status !== "OUT_OF_STOCK" && (row.stockQuantity === null || row.stockQuantity > 0),
        displayAttributes: attributesByProductId.get(row.id) ?? [],
      };
    }),
  };
}

export async function loadDisplayGroup(prisma, productId, resolvePrices) {
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT g.id AS "groupId", g."displayName", p.id, p.sku, p.slug, p.name, p."nameAr", p.price, p."salePrice", p."stockQuantity", p.status::text AS status, p."isAvailable"
         FROM product_display_group_members self
         JOIN product_display_groups g ON g.id = self."groupId"
         JOIN product_display_group_members m ON m."groupId" = g.id
         JOIN "Product" p ON p.id = m."productId"
        WHERE self."productId" = $1 AND ${PUBLIC_MEMBER_FILTER}
        ORDER BY m."sortOrder", p.id`,
      productId
    );
    if (rows.length < 2) return null;
    const attributeRows = await prisma.$queryRawUnsafe(
      `SELECT "productId", type, "valueEn", "valueAr" FROM product_display_attributes
        WHERE "isVisible" = true AND "productId" = ANY($1::text[])
        ORDER BY "sortOrder", "createdAt", id`,
      rows.map((row) => row.id)
    );
    const pricing = await resolvePrices(rows);
    return shapeDisplayGroup(rows, attributeRows, pricing);
  } catch {
    return null;
  }
}

// One step only: a redirect is followed solely to a product on sale, and a hidden target is treated as no redirect.
export async function findRedirectTarget(prisma, slug) {
  try {
    const rows = await prisma.$queryRawUnsafe(
      `SELECT p.id FROM product_redirects r JOIN "Product" p ON p.id = r."toProductId"
        WHERE lower(r."fromSlug") = lower($1) AND ${PUBLIC_MEMBER_FILTER}`,
      slug
    );
    return rows[0]?.id ?? null;
  } catch {
    return null;
  }
}
