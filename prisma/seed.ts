import { PrismaClient } from "@prisma/client";
import { categories } from "../src/data/categories";
import { controversies } from "../src/data/controversies";
import { brands } from "../src/data/brands";

const prisma = new PrismaClient({});

async function main() {
  console.log("Seeding database...");

  // 1. Seed Categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { id: cat.id },
      update: {},
      create: {
        id: cat.id,
        name: cat.name,
        nameId: cat.nameId,
        icon: cat.icon,
        brandCount: cat.brandCount,
      },
    });
  }

  // 2. Seed Controversies
  for (const con of controversies) {
    await prisma.controversy.upsert({
      where: { id: con.id },
      update: {},
      create: {
        id: con.id,
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

  // 3. Seed Brands (First pass without relations)
  for (const b of brands) {
    await prisma.brand.upsert({
      where: { id: b.id },
      update: {},
      create: {
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

  // 4. Seed Related Data (Controversies relation, Certifications, Sources, Alternatives)
  for (const b of brands) {
    // Controversies
    for (const cId of b.controversyIds) {
      // make sure controversy exists
      const exists = controversies.some((c) => c.id === cId);
      if (exists) {
        await prisma.brandControversy.upsert({
          where: {
            brandId_controversyId: {
              brandId: b.id,
              controversyId: cId,
            },
          },
          update: {},
          create: {
            brandId: b.id,
            controversyId: cId,
          },
        });
      }
    }

    // Certifications
    for (const cert of b.certifications) {
      // Find existing exactly
      const existing = await prisma.brandCertification.findFirst({
        where: { brandId: b.id, certification: cert },
      });
      if (!existing) {
        await prisma.brandCertification.create({
          data: {
            brandId: b.id,
            certification: cert,
          },
        });
      }
    }

    // Sources
    for (const src of (b.sources || [])) {
      const existing = await prisma.source.findFirst({
        where: { brandId: b.id, url: src.url },
      });
      if (!existing) {
        let dateValue = new Date(src.date);
        if (isNaN(dateValue.getTime())) {
             dateValue = new Date(`${src.date}-01`); // fallback
        }
        await prisma.source.create({
          data: {
            brandId: b.id,
            title: src.title,
            url: src.url,
            date: dateValue,
          },
        });
      }
    }

    // Alternatives
    for (const aId of b.alternativeIds) {
      // assume it exists if it is in alternativeIds, some might not be in the mock DB
      const altExists = await prisma.brand.findUnique({ where: { id: aId } });
      if (altExists) {
        await prisma.brandAlternative.upsert({
          where: {
            brandId_alternativeId: {
              brandId: b.id,
              alternativeId: aId,
            },
          },
          update: {},
          create: {
            brandId: b.id,
            alternativeId: aId,
          },
        });
      }
    }
  }

  console.log("Seeding finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
