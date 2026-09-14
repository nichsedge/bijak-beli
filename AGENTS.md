<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Bijak Beli Repository Guidelines

## 🏗️ Architecture & Conventions
- **Next.js 16 + React 19 Standards**:
  - Avoid synchronous `setState` in `useEffect`. Use render-time state adjustment or `useSyncExternalStore` for client hydration checks.
  - Turbopack App Router (`src/app/`) with Server Components default; interactive components marked with `"use client"`.
- **Database & Drizzle ORM**:
  - SQLite/LibSQL database (`drizzle.db`) with schema in `src/db/schema.ts`.
  - Push schema migrations: `bun run db:push`
  - Seed database with all brands and conglomerates: `bun run db:seed`
- **Data Model & Conglomerates**:
  - Brands (`src/data/brands.ts`) are categorized and linked to business groups via `conglomerateId`.
  - Conglomerate records are defined in `src/data/conglomerates.ts` with tycoons and Power200 rankings.
- **Barcode & Camera Engine**:
  - Canonical barcodes are mapped in `src/lib/barcode-resolver.ts`.
  - Scanners support native `BarcodeDetector`, WebRTC video streams, torch/flash controls, and image file uploads.

