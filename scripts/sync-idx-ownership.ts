#!/usr/bin/env bun
// Sync idx-bei ownership into bijak-beli: enrich ultimateOwner and powerMapRank from Power200 + companyDetails
import fs from "fs";
import path from "path";

const idxMapPath = path.join(import.meta.dir, "../src/data/idx-mapping.json");
const bijakBrandsPath = path.join(import.meta.dir, "../src/data/brands.ts");
const conglomeratesPath = path.join(import.meta.dir, "../src/data/conglomerates.ts");
const power200Path = path.join(import.meta.dir, "../../idx-bei/data/power200.json");
const companyDetailsPath = path.join(import.meta.dir, "../../idx-bei/data/companyDetailsByKodeEmiten.json");

const idxMap = JSON.parse(fs.readFileSync(idxMapPath, "utf-8"));

let power200: any[] = [];
try { power200 = JSON.parse(fs.readFileSync(power200Path, "utf-8")); } catch {}

let details: Record<string, any> = {};
try { details = JSON.parse(fs.readFileSync(companyDetailsPath, "utf-8")); } catch {}

// Import current brands and conglomerates
const { brands } = await import(bijakBrandsPath);
const { conglomerates } = await import(conglomeratesPath);
const congMap = new Map(conglomerates.map((c: any) => [c.id, c]));

function getUbo(ticker: string): string {
  const d = details[ticker];
  if (!d) return "";

  // 1. Match against Power200 tycoons
  const p200Match = power200.find((p: any) => (p.companies || []).includes(ticker));
  const p200Name = p200Match ? `${p200Match.insider} (Power200 #${p200Match.rank})` : "";

  // 2. Extract Top 2 Shareholders
  const shareholders = (d.PemegangSaham || [])
    .filter((s: any) => s.Jumlah > 0)
    .slice(0, 2)
    .map((s: any) => `${s.Nama}${s.Persentase ? ` (${s.Persentase}%)` : ""}`)
    .join(", ");

  if (p200Name && shareholders) {
    return `${p200Name} / ${shareholders}`;
  }
  if (shareholders) return shareholders;
  const profiles = d.Profiles?.[0];
  return profiles?.NamaEmiten || ticker;
}

let updated = 0;
const enriched = brands.map((b: any) => {
  const brand = { ...b };
  const meta = idxMap[brand.id];

  if (meta?.ticker) {
    brand.idxTicker = meta.ticker;
    brand.idxUrl = `https://www.idx.co.id/id/perusahaan-tercatat/profil-perusahaan-tercatat/${meta.ticker}`;

    const ubo = getUbo(meta.ticker);
    if (ubo) {
      brand.ultimateOwner = ubo;
      updated++;
    }

    const p200Match = power200.find((p: any) => (p.companies || []).includes(meta.ticker));
    if (p200Match) {
      brand.powerMapRank = p200Match.rank;
    }
  }

  // Inherit powerMapRank from conglomerate if still unset
  if (!brand.powerMapRank && brand.conglomerateId) {
    const c = congMap.get(brand.conglomerateId) as any;
    if (c?.powerMapRank) {
      brand.powerMapRank = c.powerMapRank;
    }
  }

  return brand;
});

const fileHeader = `import type { Brand } from "@/lib/types";\n\nexport const brands: Brand[] = `;
fs.writeFileSync(bijakBrandsPath, `${fileHeader}${JSON.stringify(enriched, null, 2)};\n`);

console.log(`Synced ${updated} brands from idx-bei (${companyDetailsPath})`);
console.log(`Total brands catalog: ${enriched.length}`);
console.log(`Brands with Power200 rank: ${enriched.filter((b: any) => b.powerMapRank).length}`);
