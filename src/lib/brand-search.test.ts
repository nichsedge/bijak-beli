import { describe, it, expect } from "bun:test";
import { matchesBrandQuery, filterBrands } from "./brand-search";
import type { Brand, Conglomerate } from "./types";

const mockConglomerate: Conglomerate = {
  id: "salim-group",
  name: "Salim Group",
  tycoon: "Anthony Salim & Franciscus Welirang",
  powerMapRank: 17,
  description: "Test description",
  descriptionId: "Deskripsi tes",
  headquarters: "Jakarta",
  listedEntities: ["INDF", "ICBP", "SIMP"],
  keySectors: ["Food & Beverage"],
  brandCount: 2,
};

const mockConglomerateMap = new Map<string, Conglomerate>([
  [mockConglomerate.id, mockConglomerate],
]);

const mockBrand: Brand = {
  id: "indomie",
  name: "Indomie",
  nameId: "Indomie",
  logo: "/logos/indomie.svg",
  category: "food-beverage",
  subcategory: "Instant Noodles",
  tagline: "Seleraku",
  taglineId: "Seleraku",
  description: "Mi instan nomor satu",
  descriptionId: "Mi instan nomor satu",
  country: "ID",
  parentCompany: "Indofood CBP",
  ultimateOwner: "Franciscus Welirang / PT Indofood Sukses Makmur Tbk",
  conglomerateId: "salim-group",
  idxTicker: "ICBP",
  halalCertified: true,
  boycottActive: false,
  scores: { halal: 95, ethical: 72, esg: 65, political: 90, community: 88 },
  certifications: ["Halal MUI"],
  controversyIds: [],
  alternativeIds: ["mie-sedaap"],
  sources: [],
  communityVotes: { up: 100, down: 5 },
  lastUpdated: "2025-01-01",
};

const mockBrand2: Brand = {
  id: "pepsodent",
  name: "Pepsodent",
  logo: "/logos/pepsodent.svg",
  category: "personal-care",
  subcategory: "Oral Care",
  tagline: "Senyum Indonesia",
  taglineId: "Senyum Indonesia",
  description: "Pasta gigi terpercaya",
  descriptionId: "Pasta gigi terpercaya",
  country: "ID",
  parentCompany: "Unilever Indonesia",
  ultimateOwner: "Unilever PLC",
  conglomerateId: "unilever-indonesia",
  idxTicker: "UNVR",
  halalCertified: true,
  boycottActive: true,
  scores: { halal: 90, ethical: 50, esg: 60, political: 40, community: 60 },
  certifications: ["Halal MUI"],
  controversyIds: [],
  alternativeIds: ["ciptadent"],
  sources: [],
  communityVotes: { up: 50, down: 40 },
  lastUpdated: "2025-01-01",
};

describe("Brand Omnisearch Matching", () => {
  it("matches brand name and case-insensitively", () => {
    expect(matchesBrandQuery(mockBrand, "indomie", mockConglomerateMap)).toBe(true);
    expect(matchesBrandQuery(mockBrand, "INDOMIE", mockConglomerateMap)).toBe(true);
    expect(matchesBrandQuery(mockBrand, "Indo", mockConglomerateMap)).toBe(true);
  });

  it("matches parent company and ultimate owner", () => {
    expect(matchesBrandQuery(mockBrand, "Indofood", mockConglomerateMap)).toBe(true);
    expect(matchesBrandQuery(mockBrand, "Welirang", mockConglomerateMap)).toBe(true);
    expect(matchesBrandQuery(mockBrand, "Sukses Makmur", mockConglomerateMap)).toBe(true);
  });

  it("matches IDX ticker", () => {
    expect(matchesBrandQuery(mockBrand, "ICBP", mockConglomerateMap)).toBe(true);
    expect(matchesBrandQuery(mockBrand, "icbp", mockConglomerateMap)).toBe(true);
    expect(matchesBrandQuery(mockBrand2, "UNVR", mockConglomerateMap)).toBe(true);
  });

  it("matches subcategory", () => {
    expect(matchesBrandQuery(mockBrand, "Instant Noodles", mockConglomerateMap)).toBe(true);
    expect(matchesBrandQuery(mockBrand, "noodles", mockConglomerateMap)).toBe(true);
    expect(matchesBrandQuery(mockBrand2, "Oral Care", mockConglomerateMap)).toBe(true);
  });

  it("matches conglomerate name, tycoons, and listed entities from conglomerate map", () => {
    // Salim group matches
    expect(matchesBrandQuery(mockBrand, "Salim", mockConglomerateMap)).toBe(true);
    expect(matchesBrandQuery(mockBrand, "Anthony Salim", mockConglomerateMap)).toBe(true);
    expect(matchesBrandQuery(mockBrand, "INDF", mockConglomerateMap)).toBe(true);

    // Unilever should not match Salim
    expect(matchesBrandQuery(mockBrand2, "Salim", mockConglomerateMap)).toBe(false);
  });

  it("returns true for empty or whitespace query", () => {
    expect(matchesBrandQuery(mockBrand, "", mockConglomerateMap)).toBe(true);
    expect(matchesBrandQuery(mockBrand, "   ", mockConglomerateMap)).toBe(true);
  });
});

describe("Joint Brand Filtering", () => {
  const brandList = [mockBrand, mockBrand2];

  it("filters by category without dropping query match", () => {
    // Searching "indo" in food-beverage should match indomie
    const res1 = filterBrands(brandList, { query: "indo", category: "food-beverage", conglomerateMap: mockConglomerateMap });
    expect(res1.length).toBe(1);
    expect(res1[0].id).toBe("indomie");

    // Searching "indo" in personal-care (Unilever Indonesia) should match pepsodent
    const res2 = filterBrands(brandList, { query: "indonesia", category: "personal-care", conglomerateMap: mockConglomerateMap });
    expect(res2.length).toBe(1);
    expect(res2[0].id).toBe("pepsodent");

    // Searching "Salim" in personal-care should return 0
    const res3 = filterBrands(brandList, { query: "Salim", category: "personal-care", conglomerateMap: mockConglomerateMap });
    expect(res3.length).toBe(0);
  });

  it("filters by boycott status", () => {
    const activeOnly = filterBrands(brandList, { boycottStatus: "active" });
    expect(activeOnly.length).toBe(1);
    expect(activeOnly[0].id).toBe("pepsodent");

    const noneOnly = filterBrands(brandList, { boycottStatus: "none" });
    expect(noneOnly.length).toBe(1);
    expect(noneOnly[0].id).toBe("indomie");
  });
});
