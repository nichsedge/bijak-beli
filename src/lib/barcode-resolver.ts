export interface BarcodeResolution {
  brandId: string;
  name: string;
  source: "local" | "openfoodfacts" | "fallback";
  parentCompany?: string;
  productName?: string;
}

// Canonical Indonesian FMCG barcode prefix dictionary mapping to brand slugs
export const LOCAL_BARCODE_MAP: Record<string, { brandId: string; name: string; company?: string }> = {
  // Indomie (Indofood)
  "8998866200224": { brandId: "indomie", name: "Indomie Goreng Spesial", company: "Indofood CBP" },
  "8998866200019": { brandId: "indomie", name: "Indomie Kuah Kari Ayam", company: "Indofood CBP" },
  "8998866200057": { brandId: "indomie", name: "Indomie Ayam Bawang", company: "Indofood CBP" },
  "8998866200118": { brandId: "indomie", name: "Indomie Soto Mie", company: "Indofood CBP" },
  // Mie Sedaap (Wings)
  "8992388114120": { brandId: "mie-sedaap", name: "Mie Sedaap Goreng", company: "Wings Group" },
  "8992388114229": { brandId: "mie-sedaap", name: "Mie Sedaap Soto", company: "Wings Group" },
  // Sarimi (Indofood)
  "8998866100111": { brandId: "sarimi", name: "Sarimi Isi 2 Ayam Kecap", company: "Indofood CBP" },
  // Le Minerale (Mayora)
  "8992761011118": { brandId: "le-minerale", name: "Le Minerale 600ml", company: "Mayora Indah" },
  // Mayora - Teh Pucuk
  "8992761132110": { brandId: "mayora", name: "Teh Pucuk Harum 350ml", company: "Mayora Indah" },
  // Aqua (Danone)
  "8992696404412": { brandId: "aqua", name: "Aqua 600ml", company: "Danone" },
  // Teh Botol Sosro
  "8992753112229": { brandId: "teh-botol-sosro", name: "Teh Botol Sosro Kotak 250ml", company: "Rekso Group" },
  // Ultra Milk (Ultrajaya)
  "8992759110010": { brandId: "ultra-milk", name: "Ultra Milk Cokelat 250ml", company: "Ultrajaya" },
  // Tolak Angin (Sido Muncul)
  "8993005120015": { brandId: "tolak-angin", name: "Tolak Angin Cair Herbal", company: "Sido Muncul" },
  // Sari Roti
  "8992751010015": { brandId: "sari-roti", name: "Sari Roti Tawar Spesial", company: "Nippon Indosari Corpindo" },
  // Kapal Api
  "8996001301017": { brandId: "kapal-api", name: "Kopi Kapal Api Special", company: "Kapal Api Global" },
  // Pepsodent (Unilever)
  "8999999195518": { brandId: "pepsodent", name: "Pepsodent White 120g", company: "Unilever Indonesia" },
  // Lifebuoy (Unilever)
  "8999999052026": { brandId: "lifebuoy", name: "Lifebuoy Total 10 Soap", company: "Unilever Indonesia" },
  // Pocari Sweat (Otsuka)
  "8992741982001": { brandId: "pocari-sweat", name: "Pocari Sweat 500ml", company: "Amerta Indah Otsuka" },
  // Wardah (Paragon)
  "8993137703025": { brandId: "wardah", name: "Wardah Lightening Serum Ampoule", company: "Paragon Technology" },
  // Emina (Paragon)
  "8993137703094": { brandId: "emina", name: "Emina Bright Stuff Face Wash", company: "Paragon Technology" },
  // Nestle Bear Brand
  "8992695123017": { brandId: "nestle", name: "Bear Brand Susu Steril", company: "Nestle Indonesia" },
};

// Brand alias resolver to map external brand names to bijak-beli brand slugs
const BRAND_ALIASES: Record<string, string> = {
  indomie: "indomie",
  indofood: "indomie",
  "mie sedaap": "mie-sedaap",
  wings: "mie-sedaap",
  sarimi: "sarimi",
  mayora: "mayora",
  "le minerale": "le-minerale",
  danone: "aqua",
  aqua: "aqua",
  unilever: "unilever",
  pepsodent: "pepsodent",
  lifebuoy: "lifebuoy",
  rinso: "unilever",
  sunsilk: "unilever",
  bango: "unilever",
  nestle: "nestle",
  "nestlé": "nestle",
  "pocari sweat": "pocari-sweat",
  otsuka: "pocari-sweat",
  wardah: "wardah",
  emina: "emina",
  paragon: "wardah",
  starbucks: "starbucks",
  mcdonald: "mcdonald",
  "mcdonald's": "mcdonald",
  "kopi kenangan": "kopi-kenangan",
  zara: "zara",
  inditex: "zara",
  "h&m": "hm",
  hm: "hm",
  samsung: "samsung",
  oppo: "oppo",
  "janji jiwa": "janji-jiwa",
  sosro: "teh-botol-sosro",
  ultrajaya: "ultra-milk",
  "sido muncul": "tolak-angin",
};

export async function resolveBarcode(barcode: string): Promise<BarcodeResolution> {
  const clean = barcode.trim();
  if (!clean) {
    return { brandId: "indomie", name: "Unknown", source: "fallback" };
  }

  // 1. Direct local dictionary match (0ms latency)
  if (LOCAL_BARCODE_MAP[clean]) {
    const item = LOCAL_BARCODE_MAP[clean];
    return {
      brandId: item.brandId,
      name: item.name,
      source: "local",
      parentCompany: item.company,
    };
  }

  // 2. Open Food Facts API lookup (with 3.5s timeout)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(clean)}.json`, {
      headers: {
        "User-Agent": "BijakBeli-App/1.0 (https://bijakbeli.id; muhammad.ichsanul19@gmail.com)",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        const rawBrand = (p.brands || "").toLowerCase().trim();
        const productName = p.product_name || p.product_name_en || p.product_name_id || clean;

        // Check if rawBrand matches any alias
        for (const [alias, brandId] of Object.entries(BRAND_ALIASES)) {
          if (rawBrand.includes(alias)) {
            return {
              brandId,
              name: productName,
              productName,
              parentCompany: p.brands,
              source: "openfoodfacts",
            };
          }
        }

        // Return with candidate slug or fallback
        const candidateSlug = rawBrand.split(",")[0].trim().toLowerCase().replace(/\s+/g, "-");
        return {
          brandId: candidateSlug || "indomie",
          name: productName,
          productName,
          parentCompany: p.brands || "Unknown Manufacturer",
          source: "openfoodfacts",
        };
      }
    }
  } catch {
    // Network / abort error - fallback smoothly
  }

  // 3. Fallback heuristic
  return {
    brandId: clean.toLowerCase(),
    name: `Product (${clean})`,
    source: "fallback",
  };
}
