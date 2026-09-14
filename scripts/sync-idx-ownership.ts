#!/usr/bin/env bun
// Sync idx-bei ownership into bijak-beli: enrich ultimateOwner from Power200 + companyDetails
import fs from "fs";
import path from "path";

const idxMap = JSON.parse(fs.readFileSync(path.join(import.meta.dir, "../src/data/idx-mapping.json"), "utf-8"));
const bijakBrandsPath = path.join(import.meta.dir, "../src/data/brands.ts");
const power200Path = path.join(import.meta.dir, "../../idx-bei/data/power200.json");
const companyDetailsPath = path.join(import.meta.dir, "../../idx-bei/data/companyDetailsByKodeEmiten.json");

let power200: any[] = [];
try { power200 = JSON.parse(fs.readFileSync(power200Path, "utf-8")); } catch {}

let details: Record<string, any> = {};
try { details = JSON.parse(fs.readFileSync(companyDetailsPath, "utf-8")); } catch {}

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

let txt = fs.readFileSync(bijakBrandsPath, "utf-8");
let updated = 0;
for (const [brandId, meta] of Object.entries(idxMap) as any) {
  if (!meta.ticker) continue;
  const ubo = getUbo(meta.ticker);
  if (!ubo) continue;
  
  // Match both "id": "foo" and id: "foo"
  const re = new RegExp(`(["']?id["']?\\s*:\\s*["']${brandId}["'][\\s\\S]*?["']?ultimateOwner["']?\\s*:\\s*["'])[^\"]*(["'])`);
  if (re.test(txt)) {
    txt = txt.replace(re, `$1${ubo.replace(/\"/g,'\\"')}$2`);
    updated++;
  }
}
fs.writeFileSync(bijakBrandsPath, txt);
console.log(`synced ${updated} brands from idx-bei ${companyDetailsPath}`);
console.log(`Power200 top: ${power200.slice(0,3).map((p:any)=>p.insider).join(", ")}`);
