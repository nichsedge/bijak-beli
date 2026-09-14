"use server";

import { db } from "./db";
import * as schema from "../db/schema";
import type { Brand, Category, Controversy, Conglomerate, DocType } from "./types";
import { inArray, eq } from "drizzle-orm";
import { conglomerates as localConglomerates } from "@/data/conglomerates";

type DbBrandRecord = typeof schema.brands.$inferSelect & {
  certifications?: Array<{ certification: string }>;
  controversies?: Array<{ controversyId: string }>;
  alternatives?: Array<{ alternativeId: string }>;
  sources?: Array<{
    title: string;
    url: string;
    archiveUrl: string | null;
    publisher: string | null;
    docType: string | null;
    confidence: string | null;
    documentId: string | null;
    date: Date | string | number;
  }>;
};

function mapDbBrandToBrand(dbBrand: DbBrandRecord): Brand {
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
    conglomerateId: dbBrand.conglomerateId || undefined,
    ultimateOwner: dbBrand.ultimateOwner || undefined,
    ownerCountry: dbBrand.ownerCountry || undefined,
    foundedYear: dbBrand.foundedYear || undefined,
    halalCertified: Boolean(dbBrand.halalCertified),
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
    certifications: dbBrand.certifications?.map((c) => c.certification) || [],
    controversyIds: dbBrand.controversies?.map((c) => c.controversyId) || [],
    alternativeIds: dbBrand.alternatives?.map((a) => a.alternativeId) || [],
    sources: dbBrand.sources?.map((s) => ({
      title: s.title,
      url: s.url,
      archiveUrl: s.archiveUrl || undefined,
      publisher: s.publisher || undefined,
      docType: (s.docType as DocType) || undefined,
      confidence: (s.confidence as "high" | "medium" | "low") || "high",
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
    boycottActive: Boolean(dbBrand.boycottActive),
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

  return (brands as DbBrandRecord[]).map(mapDbBrandToBrand);
}

export async function fetchCategories(): Promise<Category[]> {
  const cats = await db.query.categories.findMany();
  return cats.map((c) => ({
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
  
  return (brands as DbBrandRecord[]).map(mapDbBrandToBrand);
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
  return mapDbBrandToBrand(brand as DbBrandRecord);
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
  return (brands as DbBrandRecord[]).map(mapDbBrandToBrand);
}

export async function fetchBrandsByConglomerate(conglomerateId: string): Promise<Brand[]> {
  const brands = await db.query.brands.findMany({
    where: eq(schema.brands.conglomerateId, conglomerateId),
    with: {
      controversies: true,
      certifications: true,
      sources: true,
      alternatives: true,
    }
  });
  return (brands as DbBrandRecord[]).map(mapDbBrandToBrand);
}

export async function fetchConglomerates(): Promise<Conglomerate[]> {
  try {
    const list = await db.query.conglomerates.findMany();
    if (list && list.length > 0) {
      return list.map((c) => ({
        id: c.id,
        name: c.name,
        tycoon: c.tycoon,
        powerMapRank: c.powerMapRank ?? undefined,
        description: c.description,
        descriptionId: c.descriptionId,
        headquarters: c.headquarters,
        keySectors: JSON.parse(c.keySectors || "[]"),
        listedEntities: JSON.parse(c.listedEntities || "[]"),
      }));
    }
  } catch {
    // Fallback to static data
  }
  return localConglomerates;
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
    severity: c.severity as Controversy["severity"],
    source: c.source,
    sourceUrl: c.sourceUrl,
  };
}
