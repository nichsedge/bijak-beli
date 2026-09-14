import { sqliteTable, text, integer, primaryKey } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameId: text("name_id").notNull(),
  icon: text("icon").notNull(),
  brandCount: integer("brand_count").default(0).notNull(),
});

export const brands = sqliteTable("brands", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  nameId: text("name_id"),
  logo: text("logo").notNull(),
  categoryId: text("category_id")
    .notNull()
    .references(() => categories.id),
  subcategory: text("subcategory"),
  tagline: text("tagline").notNull(),
  taglineId: text("tagline_id").notNull(),
  country: text("country").notNull(),
  parentCompany: text("parent_company"),
  ultimateOwner: text("ultimate_owner"),
  ownerCountry: text("owner_country"),
  foundedYear: integer("founded_year"),
  halalCertified: integer("halal_certified", { mode: "boolean" }).notNull(),
  halalCertifier: text("halal_certifier"),
  halalCertId: text("halal_cert_id"),
  bpomId: text("bpom_id"),
  idxTicker: text("idx_ticker"),
  idxUrl: text("idx_url"),
  powerMapRank: integer("power_map_rank"),

  // Scores
  scoreHalal: integer("score_halal").notNull(),
  scoreEthical: integer("score_ethical").notNull(),
  scoreEsg: integer("score_esg").notNull(),
  scorePolitical: integer("score_political").notNull(),
  scoreCommunity: integer("score_community").notNull(),

  communityVotesUp: integer("community_votes_up").default(0).notNull(),
  communityVotesDown: integer("community_votes_down").default(0).notNull(),

  lastUpdated: integer("last_updated", { mode: "timestamp" }).notNull(),
  description: text("description").notNull(),
  descriptionId: text("description_id").notNull(),
  boycottActive: integer("boycott_active", { mode: "boolean" }).notNull(),
  boycottReason: text("boycott_reason"),
  boycottReasonId: text("boycott_reason_id"),
});

export const controversies = sqliteTable("controversies", {
  id: text("id").primaryKey(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  title: text("title").notNull(),
  titleId: text("title_id").notNull(),
  description: text("description").notNull(),
  descriptionId: text("description_id").notNull(),
  severity: text("severity").notNull(), // "low" | "medium" | "high" | "critical"
  source: text("source").notNull(),
  sourceUrl: text("source_url").notNull(),
});

export const brandControversies = sqliteTable(
  "brand_controversies",
  {
    brandId: text("brand_id")
      .notNull()
      .references(() => brands.id),
    controversyId: text("controversy_id")
      .notNull()
      .references(() => controversies.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.brandId, t.controversyId] }),
  })
);

export const brandCertifications = sqliteTable("brand_certifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  brandId: text("brand_id")
    .notNull()
    .references(() => brands.id),
  certification: text("certification").notNull(),
});

export const sources = sqliteTable("sources", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  url: text("url").notNull(),
  archiveUrl: text("archive_url"),
  publisher: text("publisher"),
  docType: text("doc_type"),
  confidence: text("confidence"),
  documentId: text("document_id"),
  date: integer("date", { mode: "timestamp" }).notNull(),
  brandId: text("brand_id")
    .notNull()
    .references(() => brands.id),
});

export const brandAlternatives = sqliteTable(
  "brand_alternatives",
  {
    brandId: text("brand_id")
      .notNull()
      .references(() => brands.id),
    alternativeId: text("alternative_id")
      .notNull()
      .references(() => brands.id),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.brandId, t.alternativeId] }),
  })
);

// Relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  brands: many(brands),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  category: one(categories, {
    fields: [brands.categoryId],
    references: [categories.id],
  }),
  controversies: many(brandControversies),
  certifications: many(brandCertifications),
  sources: many(sources),
  alternatives: many(brandAlternatives, { relationName: "brandToAlternative" }),
  alternativeOf: many(brandAlternatives, { relationName: "alternativeToBrand" }),
}));

export const controversiesRelations = relations(controversies, ({ many }) => ({
  brands: many(brandControversies),
}));

export const brandControversiesRelations = relations(brandControversies, ({ one }) => ({
  brand: one(brands, {
    fields: [brandControversies.brandId],
    references: [brands.id],
  }),
  controversy: one(controversies, {
    fields: [brandControversies.controversyId],
    references: [controversies.id],
  }),
}));

export const brandCertificationsRelations = relations(brandCertifications, ({ one }) => ({
  brand: one(brands, {
    fields: [brandCertifications.brandId],
    references: [brands.id],
  }),
}));

export const sourcesRelations = relations(sources, ({ one }) => ({
  brand: one(brands, {
    fields: [sources.brandId],
    references: [brands.id],
  }),
}));

export const brandAlternativesRelations = relations(brandAlternatives, ({ one }) => ({
  brand: one(brands, {
    fields: [brandAlternatives.brandId],
    references: [brands.id],
    relationName: "brandToAlternative",
  }),
  alternative: one(brands, {
    fields: [brandAlternatives.alternativeId],
    references: [brands.id],
    relationName: "alternativeToBrand",
  }),
}));
