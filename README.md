# 🛒 Bijak Beli (Smart Ethical Consumer Platform)

A modern Next.js 16 + React 19 web application that decodes consumer brands in Indonesia, revealing their **Ultimate Beneficial Owners (UBO)**, conglomerate affiliations, tycoon ties, and ethical scores.

🌐 **Live App**: [https://bijak-beli.vercel.app](https://bijak-beli.vercel.app)

---

## ✨ Features

- 🔍 **Brand-to-Oligarch Transparency**: Look up consumer products (Indomie, Mie Sedaap, Mayora, Unilever, Gojek) and see who actually owns and profits from them.
- 🏢 **Retail Conglomerate Directory (`/conglomerates`)**: Explore Indonesia's FMCG landscape by tycoon empire (Salim, Wings, Mayora, Unilever, Danone, Djarum, Sinar Mas, Wilmar, Musim Mas, etc.).
- 🏛️ **IDX-BEI Quantitative Integration**: Synchronizes ownership data, shareholding percentages, and Power200 tycoon ranks directly from `~/Projects/idx-bei`.
- 📷 **Real-Time Barcode & Product Scanner**: Scan physical barcodes with device camera (BarcodeDetector API), flashlight/torch toggle, photo file upload fallback, or manual EAN-13 input.
- ⚡ **Turbopack & Modern Stack**: Next.js 16 (App Router), React 19, TypeScript, Drizzle ORM (LibSQL), Lucide icons.

---

## 🚀 Quick Start

### Installation & Development

```bash
# Install dependencies
bun install

# Seed or migrate SQLite database with Drizzle
bun run db:push
bun run db:seed

# Sync brand ownership from idx-bei
bun run sync:ownership

# Start development server on port 3888
bun run dev

# Run linter
bun run lint

# Build production bundle
bun run build
```

---

## 🔄 Ownership Pipeline

`scripts/sync-idx-ownership.ts` reads `idx-mapping.json`, matches tickers against `~/Projects/idx-bei/data/companyDetailsByKodeEmiten.json` and `power200.json`, and enriches `src/data/brands.ts` with:
- Top 2 major shareholders & equity percentages.
- Power200 tycoon / insider ranking.
