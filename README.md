# 🛒 Bijak Beli (Smart Ethical Consumer Platform)

A modern Next.js 16 + React 19 web application that decodes consumer brands in Indonesia, revealing their **Ultimate Beneficial Owners (UBO)**, conglomerate affiliations, tycoon ties, and ethical scores.

🌐 **Live App**: [https://bijak-beli.vercel.app](https://bijak-beli.vercel.app)

---

## ✨ Features

- 🔍 **Brand-to-Oligarch Transparency**: Look up consumer products (Indomie, Mie Sedaap, Mayora, Unilever, Gojek) and see who actually owns and profits from them.
- 🏛️ **IDX-BEI Quantitative Integration**: Synchronizes ownership data, shareholding percentages, and Power200 tycoon ranks directly from `~/Projects/idx-bei`.
- 📷 **Barcode & Product Scanner**: Look up products via `/scan` and inspect brand comparisons.
- ⚡ **Turbopack & Modern Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide icons.

---

## 🚀 Quick Start

### Installation & Development

```bash
# Install dependencies
bun install

# Sync brand ownership from idx-bei
bun run sync:ownership

# Start development server on port 3888
bun run dev

# Build production bundle
bun run build
```

---

## 🔄 Ownership Pipeline

`scripts/sync-idx-ownership.ts` reads `idx-mapping.json`, matches tickers against `~/Projects/idx-bei/data/companyDetailsByKodeEmiten.json` and `power200.json`, and enriches `src/data/brands.ts` with:
- Top 2 major shareholders & equity percentages.
- Power200 tycoon / insider ranking.
