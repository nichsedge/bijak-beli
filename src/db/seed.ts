import { db } from "./index";
import * as schema from "./schema";
import { categories } from "../data/categories";
import { controversies } from "../data/controversies";
import { brands } from "../data/brands";
import { eq, and } from "drizzle-orm";

async function main() {
  console.log("Seeding database with Drizzle...");

  // 1. Seed Categories
  for (const cat of categories) {
    await db.insert(schema.categories)
      .values({
        id: cat.id,
        name: cat.name,
        nameId: cat.nameId,
        icon: cat.icon,
        brandCount: cat.brandCount,
      })
      .onConflictDoUpdate({
        target: schema.categories.id,
        set: {
          name: cat.name,
          nameId: cat.nameId,
          icon: cat.icon,
          brandCount: cat.brandCount,
        },
      });
  }

  // 2. Seed Controversies
  for (const con of controversies) {
    await db.insert(schema.controversies)
      .values({
        id: con.id,
        date: new Date(con.date),
        title: con.title,
        titleId: con.titleId,
        description: con.description,
        descriptionId: con.descriptionId,
        severity: con.severity,
        source: con.source,
        sourceUrl: con.sourceUrl,
      })
      .onConflictDoUpdate({
        target: schema.controversies.id,
        set: {
          date: new Date(con.date),
          title: con.title,
          titleId: con.titleId,
          description: con.description,
          descriptionId: con.descriptionId,
          severity: con.severity,
          source: con.source,
          sourceUrl: con.sourceUrl,
        },
      });
  }

  // 3. Seed Brands (First pass)
  for (const b of brands) {
    await db.insert(schema.brands)
      .values({
        id: b.id,
        name: b.name,
        nameId: b.nameId ?? null,
        logo: b.logo,
        categoryId: b.category,
        subcategory: b.subcategory ?? null,
        tagline: b.tagline,
        taglineId: b.taglineId,
        country: b.country,
        parentCompany: b.parentCompany ?? null,
        ultimateOwner: b.ultimateOwner ?? null,
        ownerCountry: b.ownerCountry ?? null,
        foundedYear: b.foundedYear ?? null,
        halalCertified: b.halalCertified,
        halalCertifier: b.halalCertifier ?? null,
        halalCertId: b.halalCertId ?? null,
        bpomId: b.bpomId ?? null,
        idxTicker: b.idxTicker ?? null,
        idxUrl: b.idxUrl ?? null,
        powerMapRank: b.powerMapRank ?? null,
        scoreHalal: b.scores.halal,
        scoreEthical: b.scores.ethical,
        scoreEsg: b.scores.esg,
        scorePolitical: b.scores.political,
        scoreCommunity: b.scores.community,
        communityVotesUp: b.communityVotes.up,
        communityVotesDown: b.communityVotes.down,
        lastUpdated: new Date(b.lastUpdated),
        description: b.description,
        descriptionId: b.descriptionId,
        boycottActive: b.boycottActive,
        boycottReason: b.boycottReason ?? null,
        boycottReasonId: b.boycottReasonId ?? null,
      })
      .onConflictDoUpdate({
        target: schema.brands.id,
        set: {
          name: b.name,
          nameId: b.nameId ?? null,
          logo: b.logo,
          categoryId: b.category,
          subcategory: b.subcategory ?? null,
          tagline: b.tagline,
          taglineId: b.taglineId,
          country: b.country,
          parentCompany: b.parentCompany ?? null,
          ultimateOwner: b.ultimateOwner ?? null,
          ownerCountry: b.ownerCountry ?? null,
          foundedYear: b.foundedYear ?? null,
          halalCertified: b.halalCertified,
          halalCertifier: b.halalCertifier ?? null,
          halalCertId: b.halalCertId ?? null,
          bpomId: b.bpomId ?? null,
          idxTicker: b.idxTicker ?? null,
          idxUrl: b.idxUrl ?? null,
          powerMapRank: b.powerMapRank ?? null,
          scoreHalal: b.scores.halal,
          scoreEthical: b.scores.ethical,
          scoreEsg: b.scores.esg,
          scorePolitical: b.scores.political,
          scoreCommunity: b.scores.community,
          communityVotesUp: b.communityVotes.up,
          communityVotesDown: b.communityVotes.down,
          lastUpdated: new Date(b.lastUpdated),
          description: b.description,
          descriptionId: b.descriptionId,
          boycottActive: b.boycottActive,
          boycottReason: b.boycottReason ?? null,
          boycottReasonId: b.boycottReasonId ?? null,
        },
      });
  }

  // 4. Seed Related Data
  for (const b of brands) {
    // Clear old sources for brand to ensure clean audit trail
    await db.delete(schema.sources).where(eq(schema.sources.brandId, b.id));

    // Controversies
    for (const cId of b.controversyIds) {
      const exists = controversies.some((c) => c.id === cId);
      if (exists) {
        await db.insert(schema.brandControversies)
          .values({
            brandId: b.id,
            controversyId: cId,
          })
          .onConflictDoNothing();
      }
    }

    // Certifications
    for (const cert of b.certifications) {
      const existing = await db.query.brandCertifications.findFirst({
        where: and(
          eq(schema.brandCertifications.brandId, b.id),
          eq(schema.brandCertifications.certification, cert)
        ),
      });
      if (!existing) {
        await db.insert(schema.brandCertifications).values({
          brandId: b.id,
          certification: cert,
        });
      }
    }

    // Sources (Verifiable Audit Trail)
    for (const src of (b.sources || [])) {
      let dateValue = new Date(src.date);
      if (isNaN(dateValue.getTime())) {
        dateValue = new Date(`${src.date}-01`);
      }
      await db.insert(schema.sources).values({
        brandId: b.id,
        title: src.title,
        url: src.url,
        publisher: src.publisher ?? null,
        docType: src.docType ?? null,
        confidence: src.confidence ?? "high",
        documentId: src.documentId ?? null,
        archiveUrl: src.archiveUrl ?? null,
        date: dateValue,
      });
    }

    // Alternatives
    for (const aId of b.alternativeIds) {
      const altExists = await db.query.brands.findFirst({
        where: eq(schema.brands.id, aId),
      });
      if (altExists) {
        await db.insert(schema.brandAlternatives)
          .values({
            brandId: b.id,
            alternativeId: aId,
          })
          .onConflictDoNothing();
      }
    }
  }

  console.log("Seeding finished!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
