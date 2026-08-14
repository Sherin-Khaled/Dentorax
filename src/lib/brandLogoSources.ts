export type BrandLogoReference = {
  slug: string;
  logoUrl?: string | null;
};

// Exact reviewed aliases only. These point to approved local assets; they do
// not fuzzy-match unrelated companies.
export const BRAND_LOGO_SLUG_ALIASES: Readonly<Record<string, string>> = {
  "hexa-dental": "hexa",
};

function normalizeUrl(value?: string | null) {
  return value?.trim() || null;
}

/**
 * Returns approved logo candidates in priority order. The database remains
 * authoritative, while the slug-derived public asset repairs records whose
 * approved local file exists but whose imported logoUrl was omitted. Image
 * error handling advances through this list before showing initials.
 */
export function getBrandLogoCandidates(
  brand: BrandLogoReference,
  baseUrl = "/"
) {
  const databaseUrl = normalizeUrl(brand.logoUrl);
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedSlug = brand.slug.trim().toLowerCase();
  const localAssetSlug = BRAND_LOGO_SLUG_ALIASES[normalizedSlug] ?? normalizedSlug;
  const localUrl = `${normalizedBase}brand-logos/${encodeURIComponent(localAssetSlug)}.webp`;

  return [...new Set([databaseUrl, localUrl].filter((value): value is string => Boolean(value)))];
}
