import { describe, it, expect } from "bun:test";
import {
  normalizeSubcategory,
  hasMatchingSubcategory,
  classifyOwnershipRelation,
  filterAndClassifyAlternatives,
  type BrandOwnershipInfo,
} from "./brand-alternatives";

describe("Brand Alternatives Classification & Matching Helper", () => {
  describe("normalizeSubcategory", () => {
    it("trims and lowercases valid subcategory strings", () => {
      expect(normalizeSubcategory("  Instant Noodles  ")).toBe("instant noodles");
      expect(normalizeSubcategory("Mineral Water")).toBe("mineral water");
      expect(normalizeSubcategory("Cooking Oil")).toBe("cooking oil");
    });

    it("returns empty string for null, undefined, or empty/whitespace values", () => {
      expect(normalizeSubcategory(null)).toBe("");
      expect(normalizeSubcategory(undefined)).toBe("");
      expect(normalizeSubcategory("")).toBe("");
      expect(normalizeSubcategory("   ")).toBe("");
    });
  });

  describe("hasMatchingSubcategory (strict subcategory matching)", () => {
    it("returns true when both have identical normalized subcategory", () => {
      const b1: BrandOwnershipInfo = { subcategory: "Instant Noodles", category: "food-beverage" };
      const b2: BrandOwnershipInfo = { subcategory: "instant noodles ", category: "food-beverage" };
      expect(hasMatchingSubcategory(b1, b2)).toBe(true);
    });

    it("returns false for subcategory mismatch even if broad category matches", () => {
      const noodle: BrandOwnershipInfo = { subcategory: "Instant Noodles", category: "food-beverage" };
      const oil: BrandOwnershipInfo = { subcategory: "Cooking Oil", category: "food-beverage" };
      expect(hasMatchingSubcategory(noodle, oil)).toBe(false);
    });

    it("returns false if target brand has empty or missing subcategory (never falls back to category)", () => {
      const emptySub: BrandOwnershipInfo = { subcategory: "", category: "food-beverage" };
      const cand: BrandOwnershipInfo = { subcategory: "Instant Noodles", category: "food-beverage" };
      expect(hasMatchingSubcategory(emptySub, cand)).toBe(false);

      const nullSub: BrandOwnershipInfo = { subcategory: null, category: "food-beverage" };
      expect(hasMatchingSubcategory(nullSub, cand)).toBe(false);
    });

    it("returns false if candidate brand has empty or missing subcategory", () => {
      const brand: BrandOwnershipInfo = { subcategory: "Oral Care", category: "personal-care" };
      const emptyCand: BrandOwnershipInfo = { subcategory: "   ", category: "personal-care" };
      expect(hasMatchingSubcategory(brand, emptyCand)).toBe(false);
    });
  });

  describe("classifyOwnershipRelation", () => {
    it("classifies as same-group when conglomerateId matches", () => {
      const indomie: BrandOwnershipInfo = {
        name: "Indomie",
        conglomerateId: "salim-group",
        parentCompany: "Indofood",
      };
      const sarimi: BrandOwnershipInfo = {
        name: "Sarimi",
        conglomerateId: "salim-group",
        parentCompany: "Indofood",
      };
      expect(classifyOwnershipRelation(indomie, sarimi)).toBe("same-group");
    });

    it("classifies as same-group when parentCompany matches even if conglomerateId is absent", () => {
      const brandA: BrandOwnershipInfo = {
        name: "Brand A",
        parentCompany: "PT Maju Bersama Tbk",
      };
      const brandB: BrandOwnershipInfo = {
        name: "Brand B",
        parentCompany: "pt maju bersama tbk",
      };
      expect(classifyOwnershipRelation(brandA, brandB)).toBe("same-group");
    });

    it("classifies as different-group when recorded groups/parents differ", () => {
      const indomie: BrandOwnershipInfo = {
        name: "Indomie",
        conglomerateId: "salim-group",
        parentCompany: "Indofood",
      };
      const mieSedaap: BrandOwnershipInfo = {
        name: "Mie Sedaap",
        conglomerateId: "wings-group",
        parentCompany: "Wings Food",
      };
      expect(classifyOwnershipRelation(indomie, mieSedaap)).toBe("different-group");
    });

    it("classifies as unknown when brand has unknown/missing ownership info", () => {
      const unknownBrand: BrandOwnershipInfo = {
        name: "Local Artisan",
        conglomerateId: null,
        parentCompany: undefined,
      };
      const wingsCand: BrandOwnershipInfo = {
        name: "Mie Sedaap",
        conglomerateId: "wings-group",
        parentCompany: "Wings Food",
      };
      expect(classifyOwnershipRelation(unknownBrand, wingsCand)).toBe("unknown");
    });

    it("classifies as unknown when candidate has unknown/missing ownership info", () => {
      const pepsodent: BrandOwnershipInfo = {
        name: "Pepsodent",
        conglomerateId: "unilever-indonesia",
        parentCompany: "PT Unilever Indonesia Tbk",
      };
      const unknownCand: BrandOwnershipInfo = {
        name: "Herbal Toothpaste",
        conglomerateId: "",
        parentCompany: "   ",
      };
      expect(classifyOwnershipRelation(pepsodent, unknownCand)).toBe("unknown");
    });

    it("classifies as unknown when both brand and candidate have unknown ownership", () => {
      const b1: BrandOwnershipInfo = { name: "A", conglomerateId: null, parentCompany: null };
      const b2: BrandOwnershipInfo = { name: "B", conglomerateId: "", parentCompany: "" };
      expect(classifyOwnershipRelation(b1, b2)).toBe("unknown");
    });
  });

  describe("filterAndClassifyAlternatives", () => {
    it("partitions same-group vs different-group vs unknown while enforcing subcategory match", () => {
      const indomie: BrandOwnershipInfo = {
        id: "indomie",
        name: "Indomie",
        subcategory: "Instant Noodles",
        category: "food-beverage",
        conglomerateId: "salim-group",
        parentCompany: "Indofood",
      };

      const candidates: BrandOwnershipInfo[] = [
        {
          id: "sarimi",
          name: "Sarimi",
          subcategory: "Instant Noodles",
          category: "food-beverage",
          conglomerateId: "salim-group",
          parentCompany: "Indofood",
        },
        {
          id: "mie-sedaap",
          name: "Mie Sedaap",
          subcategory: "Instant Noodles",
          category: "food-beverage",
          conglomerateId: "wings-group",
          parentCompany: "Wings Food",
        },
        {
          id: "unknown-noodle",
          name: "Warung Noodle",
          subcategory: "Instant Noodles",
          category: "food-beverage",
          conglomerateId: null,
          parentCompany: null,
        },
        {
          id: "bimoli",
          name: "Bimoli",
          subcategory: "Cooking Oil", // subcategory mismatch!
          category: "food-beverage",
          conglomerateId: "salim-group",
        },
      ];

      const result = filterAndClassifyAlternatives(indomie, candidates);

      expect(result.sameGroup.map((c) => c.id)).toEqual(["sarimi"]);
      expect(result.differentGroup.map((c) => c.id)).toEqual(["mie-sedaap"]);
      expect(result.unknownGroup.map((c) => c.id)).toEqual(["unknown-noodle"]);
      expect(result.subcategoryMismatchCount).toBe(1);
      expect(result.allValidAlternatives.map((c) => c.id)).toEqual([
        "mie-sedaap",
        "unknown-noodle",
        "sarimi",
      ]);
    });

    it("returns zero valid alternatives and tracks mismatches for zero-alt cases (e.g. Sari Roti or mismatch)", () => {
      const sariRoti: BrandOwnershipInfo = {
        id: "sari-roti",
        name: "Sari Roti",
        subcategory: "Bakery",
        category: "food-beverage",
        conglomerateId: "salim-group",
      };

      // 1. Empty candidates array
      const emptyResult = filterAndClassifyAlternatives(sariRoti, []);
      expect(emptyResult.allValidAlternatives).toHaveLength(0);
      expect(emptyResult.sameGroup).toHaveLength(0);
      expect(emptyResult.differentGroup).toHaveLength(0);
      expect(emptyResult.unknownGroup).toHaveLength(0);
      expect(emptyResult.subcategoryMismatchCount).toBe(0);

      // 2. Candidates that all fail subcategory matching
      const mismatchedCandidates: BrandOwnershipInfo[] = [
        { id: "indomie", subcategory: "Instant Noodles", category: "food-beverage" },
        { id: "aqua", subcategory: "Mineral Water", category: "food-beverage" },
      ];
      const mismatchResult = filterAndClassifyAlternatives(sariRoti, mismatchedCandidates);
      expect(mismatchResult.allValidAlternatives).toHaveLength(0);
      expect(mismatchResult.subcategoryMismatchCount).toBe(2);
    });
  });
});
