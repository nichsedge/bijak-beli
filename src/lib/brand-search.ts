import type { Brand, Conglomerate } from "./types";
import { conglomerates as defaultConglomerates } from "@/data/conglomerates";

// Pre-indexed map for instant O(1) lookup
const DEFAULT_CONGLOMERATE_MAP = new Map<string, Conglomerate>(
  defaultConglomerates.map((c) => [c.id, c])
);

/**
 * Checks if a brand matches a user search term using multi-field omnisearch:
 * - Brand Name (name, nameId)
 * - Parent Company & Ultimate Owner
 * - Stock Ticker (idxTicker)
 * - Subcategory
 * - Conglomerate Name, Tycoons, and Listed Entities
 */
export function matchesBrandQuery(
  brand: Brand,
  query: string,
  conglomerateMap: Map<string, Conglomerate> = DEFAULT_CONGLOMERATE_MAP
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  // 1. Direct name match
  if (brand.name.toLowerCase().includes(q)) return true;
  if (brand.nameId && brand.nameId.toLowerCase().includes(q)) return true;

  // 2. Parent company & Ultimate Owner match
  if (brand.parentCompany && brand.parentCompany.toLowerCase().includes(q)) return true;
  if (brand.ultimateOwner && brand.ultimateOwner.toLowerCase().includes(q)) return true;

  // 3. Stock ticker match (e.g. ICBP, MYOR, UNVR)
  if (brand.idxTicker && brand.idxTicker.toLowerCase().includes(q)) return true;

  // 4. Subcategory & broad category match
  if (brand.subcategory && brand.subcategory.toLowerCase().includes(q)) return true;
  if (brand.category.toLowerCase().includes(q)) return true;

  // 5. Conglomerate metadata match
  if (brand.conglomerateId) {
    if (brand.conglomerateId.toLowerCase().includes(q)) return true;

    const group = conglomerateMap.get(brand.conglomerateId);
    if (group) {
      if (group.name.toLowerCase().includes(q)) return true;
      if (group.tycoon.toLowerCase().includes(q)) return true;
      if (group.listedEntities.some((ticker) => ticker.toLowerCase().includes(q))) return true;
    }
  }

  return false;
}

export interface FilterBrandOptions {
  query?: string;
  category?: string;
  halalOnly?: boolean;
  boycottStatus?: "all" | "active" | "none";
  conglomerateMap?: Map<string, Conglomerate>;
}

/**
 * Jointly filters brands ensuring search query, category, halal, and boycott filters
 * apply concurrently without dropping each other.
 */
export function filterBrands(
  brands: Brand[],
  options: FilterBrandOptions
): Brand[] {
  const {
    query = "",
    category = "all",
    halalOnly = false,
    boycottStatus = "all",
    conglomerateMap = DEFAULT_CONGLOMERATE_MAP,
  } = options;

  let filtered = brands;

  // 1. Category filter (concurrent, never dropped by query)
  if (category && category !== "all") {
    filtered = filtered.filter((b) => b.category === category);
  }

  // 2. Omnisearch query filter
  if (query.trim()) {
    filtered = filtered.filter((b) => matchesBrandQuery(b, query, conglomerateMap));
  }

  // 3. Halal filter
  if (halalOnly) {
    filtered = filtered.filter((b) => b.halalCertified);
  }

  // 4. Boycott status filter
  if (boycottStatus === "active") {
    filtered = filtered.filter((b) => b.boycottActive);
  } else if (boycottStatus === "none") {
    filtered = filtered.filter((b) => !b.boycottActive);
  }

  return filtered;
}
