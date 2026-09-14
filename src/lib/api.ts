"use server";

import { db } from "./db";
import * as schema from "../db/schema";
import type { Brand, Category, Controversy, Source } from "./types";
import { inArray, eq } from "drizzle-orm";

function mapDbBrandToBrand(dbBrand: any): Brand {
  return {
    id: dbBrand.id,
    name: dbBrand.name,
    nameId: dbBrand.nameId || undefined,
    logo: dbBrand.logo,
    category: dbBrand.categoryId,
    subcategory: dbBrand.subcategory || undefined,
    tagline: dbBrand.tagline,
    taglineId: dbBrand.taglineId,
    country: dbBrand.country,
    parentCompany: dbBrand.parentCompany || undefined,
    ultimateOwner: dbBrand.ultimateOwner || undefined,
    ownerCountry: dbBrand.ownerCountry || undefined,
    foundedYear: dbBrand.foundedYear || undefined,
    halalCertified: dbBrand.halalCertified === 1 || dbBrand.halalCertified === true,
    halalCertifier: dbBrand.halalCertifier || undefined,
    halalCertId: dbBrand.halalCertId || undefined,
    bpomId: dbBrand.bpomId || undefined,
    idxTicker: dbBrand.idxTicker || undefined,
    idxUrl: dbBrand.idxUrl || undefined,
    powerMapRank: dbBrand.powerMapRank ?? undefined,
    scores: {
      halal: dbBrand.scoreHalal,
      ethical: dbBrand.scoreEthical,
      esg: dbBrand.scoreEsg,
      political: dbBrand.scorePolitical,
      community: dbBrand.scoreCommunity,
    },
    certifications: dbBrand.certifications?.map((c: any) => c.certification) || [],
    controversyIds: dbBrand.controversies?.map((c: any) => c.controversyId) || [],
    alternativeIds: dbBrand.alternatives?.map((a: any) => a.alternativeId) || [],
    sources: dbBrand.sources?.map((s: any) => ({
      title: s.title,
      url: s.url,
      archiveUrl: s.archiveUrl || undefined,
      publisher: s.publisher || undefined,
      docType: s.docType || undefined,
      confidence: s.confidence || "high",
      documentId: s.documentId || undefined,
      date: s.date instanceof Date ? s.date.toISOString().slice(0, 10) : new Date(s.date).toISOString().slice(0, 10)
    })) || [],
    communityVotes: {
      up: dbBrand.communityVotesUp,
      down: dbBrand.communityVotesDown,
    },
    lastUpdated: dbBrand.lastUpdated instanceof Date ? dbBrand.lastUpdated.toISOString().slice(0, 10) : new Date(dbBrand.lastUpdated).toISOString().slice(0, 10),
    description: dbBrand.description,
    descriptionId: dbBrand.descriptionId,
    boycottActive: dbBrand.boycottActive === 1 || dbBrand.boycottActive === true,
    boycottReason: dbBrand.boycottReason || undefined,
    boycottReasonId: dbBrand.boycottReasonId || undefined,
  };
}

export async function fetchAllBrands(): Promise<Brand[]> {
  const brands = await db.query.brands.findMany({
    with: {
      controversies: true,
      certifications: true,
      sources: true,
      alternatives: true,
    }
  });

  return brands.map(mapDbBrandToBrand);
}

export async function fetchCategories(): Promise<Category[]> {
  const cats = await db.query.categories.findMany();
  return cats.map((c: any) => ({
    id: c.id,
    name: c.name,
    nameId: c.nameId,
    icon: c.icon,
    brandCount: c.brandCount
  }));
}

export async function fetchTrendingBrands(): Promise<Brand[]> {
  const trendingIds = ["wardah", "indomie", "starbucks", "mcdonald", "kopi-kenangan", "gojek"];
  const brands = await db.query.brands.findMany({
    where: inArray(schema.brands.id, trendingIds),
    with: {
      controversies: true,
      certifications: true,
      sources: true,
      alternatives: true,
    }
  });
  
  return brands.map(mapDbBrandToBrand);
}

export async function fetchBrandById(id: string): Promise<Brand | undefined> {
  const brand = await db.query.brands.findFirst({
    where: eq(schema.brands.id, id),
    with: {
      controversies: true,
      certifications: true,
      sources: true,
      alternatives: true,
    }
  });
  
  if (!brand) return undefined;
  return mapDbBrandToBrand(brand);
}

export async function fetchAlternatives(ids: string[]): Promise<Brand[]> {
  if (ids.length === 0) return [];
  const brands = await db.query.brands.findMany({
    where: inArray(schema.brands.id, ids),
    with: {
      controversies: true,
      certifications: true,
      sources: true,
      alternatives: true,
    }
  });
  return brands.map(mapDbBrandToBrand);
}

export async function fetchControversyById(id: string): Promise<Controversy | undefined> {
  const c = await db.query.controversies.findFirst({
    where: eq(schema.controversies.id, id)
  });
  if (!c) return undefined;
  return {
    id: c.id,
    date: c.date instanceof Date ? c.date.toISOString().slice(0, 10) : new Date(c.date).toISOString().slice(0, 10),
    title: c.title,
    titleId: c.titleId,
    description: c.description,
    descriptionId: c.descriptionId,
    severity: c.severity as any,
    source: c.source,
    sourceUrl: c.sourceUrl,
  };
}
