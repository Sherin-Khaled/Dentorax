import { useEffect, useMemo, useState } from "react";
import {
  getBrandLogoCandidates,
  type BrandLogoReference,
} from "@/lib/brandLogoSources";

export function useBrandLogoSource(brand: BrandLogoReference) {
  const candidates = useMemo(
    () => getBrandLogoCandidates(brand, import.meta.env.BASE_URL),
    [brand.logoUrl, brand.slug]
  );
  const [candidateIndex, setCandidateIndex] = useState(0);

  useEffect(() => setCandidateIndex(0), [candidates]);

  return {
    logoUrl: candidates[candidateIndex] ?? null,
    handleLogoError: () => setCandidateIndex((index) => index + 1),
  };
}
