export type OwnershipRelation = "same-group" | "different-group" | "unknown";

export interface BrandOwnershipInfo {
  id?: string;
  name?: string;
  conglomerateId?: string | null;
  parentCompany?: string | null;
  subcategory?: string | null;
  category?: string | null;
}

/**
 * Normalizes a subcategory string: trims whitespace and lowercases.
 * Returns an empty string if null, undefined, or all whitespace.
 */
export function normalizeSubcategory(subcategory?: string | null): string {
  if (!subcategory) return "";
  return subcategory.trim().toLowerCase();
}

/**
 * Returns true only if both brand and candidate have non-empty, matching subcategories.
 * Never falls back to broad category.
 */
export function hasMatchingSubcategory(
  brand: BrandOwnershipInfo,
  candidate: BrandOwnershipInfo
): boolean {
  const brandSub = normalizeSubcategory(brand.subcategory);
  const candSub = normalizeSubcategory(candidate.subcategory);
  if (!brandSub || !candSub) return false;
  return brandSub === candSub;
}

/**
 * Classifies the ownership relationship between a target brand and a candidate alternative.
 *
 * Rules:
 * 1. "same-group":
 *    Both share the same recorded conglomerateId (case-insensitive), OR
 *    both share the same recorded parentCompany (case-insensitive).
 *
 * 2. "unknown":
 *    Either the target brand or candidate lacks both recorded conglomerateId and parentCompany.
 *
 * 3. "different-group":
 *    Both have recorded ownership information, and none of them match.
 *    Important note: Different recorded group is NOT proof of absolute corporate independence
 *    (e.g., joint ventures, cross-shareholdings, or supply chain partnerships may exist).
 */
export function classifyOwnershipRelation(
  brand: BrandOwnershipInfo,
  candidate: BrandOwnershipInfo
): OwnershipRelation {
  const bConglom = brand.conglomerateId?.trim().toLowerCase() || "";
  const cConglom = candidate.conglomerateId?.trim().toLowerCase() || "";

  const bParent = brand.parentCompany?.trim().toLowerCase() || "";
  const cParent = candidate.parentCompany?.trim().toLowerCase() || "";

  // Same recorded conglomerate or same recorded parent
  if ((bConglom && cConglom && bConglom === cConglom) ||
      (bParent && cParent && bParent === cParent)) {
    return "same-group";
  }

  const brandHasOwnership = Boolean(bConglom || bParent);
  const candHasOwnership = Boolean(cConglom || cParent);

  if (!brandHasOwnership || !candHasOwnership) {
    return "unknown";
  }

  return "different-group";
}

export interface FilteredAlternativesResult<T extends BrandOwnershipInfo> {
  sameGroup: T[];
  differentGroup: T[];
  unknownGroup: T[];
  allValidAlternatives: T[];
  subcategoryMismatchCount: number;
}

/**
 * Filters candidates strictly by matching nonempty normalized subcategory (never broad category),
 * then partitions into same-group, different-group, and unknown ownership.
 */
export function filterAndClassifyAlternatives<T extends BrandOwnershipInfo>(
  brand: BrandOwnershipInfo,
  candidates: T[]
): FilteredAlternativesResult<T> {
  const sameGroup: T[] = [];
  const differentGroup: T[] = [];
  const unknownGroup: T[] = [];
  let subcategoryMismatchCount = 0;

  for (const candidate of candidates) {
    if (!candidate) continue;

    if (!hasMatchingSubcategory(brand, candidate)) {
      subcategoryMismatchCount++;
      continue;
    }

    const relation = classifyOwnershipRelation(brand, candidate);
    if (relation === "same-group") {
      sameGroup.push(candidate);
    } else if (relation === "different-group") {
      differentGroup.push(candidate);
    } else {
      unknownGroup.push(candidate);
    }
  }

  return {
    sameGroup,
    differentGroup,
    unknownGroup,
    allValidAlternatives: [...differentGroup, ...unknownGroup, ...sameGroup],
    subcategoryMismatchCount,
  };
}
