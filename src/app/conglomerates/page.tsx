"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  Building2, Crown, Search, ExternalLink, 
  Layers, ShoppingBag, ArrowRight, ShieldAlert, X 
} from "lucide-react";
import { conglomerates } from "@/data/conglomerates";
import { brands } from "@/data/brands";
import { useApp } from "@/components/AppProvider";
import styles from "./conglomerates.module.css";

function ConglomeratesContent() {
  const { lang } = useApp();
  const searchParams = useSearchParams();
  const targetId = searchParams.get("id") || "";
  const paramQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(paramQuery);
  const [selectedSector, setSelectedSector] = useState<string>("all");

  // Scroll to targeted conglomerate if param exists
  useEffect(() => {
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
      }
    }
  }, [targetId]);

  // Map brands by conglomerateId
  const brandsByConglomerate = useMemo(() => {
    const map = new Map<string, typeof brands>();
    for (const b of brands) {
      if (b.conglomerateId) {
        const list = map.get(b.conglomerateId) || [];
        list.push(b);
        map.set(b.conglomerateId, list);
      }
    }
    return map;
  }, []);

  const sectors = useMemo(() => {
    const set = new Set<string>();
    conglomerates.forEach((c) => c.keySectors.forEach((s) => set.add(s)));
    return ["all", ...Array.from(set)];
  }, []);

  const targetConglomerate = useMemo(() => {
    if (!targetId) return null;
    return conglomerates.find((c) => c.id === targetId) || null;
  }, [targetId]);

  const filtered = useMemo(() => {
    return conglomerates.filter((c) => {
      // If user is searching specifically
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchesSearch =
          c.name.toLowerCase().includes(q) ||
          c.tycoon.toLowerCase().includes(q) ||
          c.listedEntities.some((t) => t.toLowerCase().includes(q)) ||
          c.headquarters.toLowerCase().includes(q);

        if (!matchesSearch) return false;
      }

      if (selectedSector !== "all" && !c.keySectors.includes(selectedSector)) return false;

      return true;
    });
  }, [searchQuery, selectedSector]);

  const totalMappedBrands = useMemo(() => {
    return brands.filter((b) => Boolean(b.conglomerateId)).length;
  }, []);

  return (
    <div className={`container ${styles.page}`}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.tag}>
          <Building2 size={14} />
          <span>{lang === "id" ? "DIREKTORI KONGLOMERASI RITEL" : "RETAIL CONGLOMERATE DIRECTORY"}</span>
        </div>
        <h1 className={styles.title}>
          {lang === "id" ? (
            <>
              Siapa Penguasa <span className={styles.titleHighlight}>Rak Minimarket</span> Indonesia?
            </>
          ) : (
            <>
              Who Controls Indonesia&apos;s <span className={styles.titleHighlight}>Retail Shelves</span>?
            </>
          )}
        </h1>
        <p className={styles.subtitle}>
          {lang === "id"
            ? "Lebih dari 80% produk makanan, minuman, dan pembersih di Indomaret & Alfamart dikuasai oleh segelintir dinasti konglomerat dan korporasi multinasional. Kenali pemilik akhir (Ultimate Beneficial Owner) di balik merek belanjaan Anda."
            : "Over 80% of packaged foods, beverages, and home care items on supermarket shelves are controlled by a handful of tycoon dynasties and multinationals. Discover the Ultimate Beneficial Owners behind your daily cart."}
        </p>
        <div className={styles.statsRow}>
          <div className={styles.statPill}>
            <Layers size={14} color="var(--primary)" />
            <span>{conglomerates.length} {lang === "id" ? "Grup Konglomerasi" : "Conglomerates"}</span>
          </div>
          <div className={styles.statPill}>
            <ShoppingBag size={14} color="var(--primary)" />
            <span>{totalMappedBrands} {lang === "id" ? "Brand Terpetakan" : "Mapped Brands"}</span>
          </div>
          <div className={styles.statPill}>
            <Crown size={14} color="#e11d48" />
            <span>{lang === "id" ? "Terintegrasi Power200 LittleSis" : "Power200 LittleSis Integrated"}</span>
          </div>
        </div>
      </section>

      {/* Target Conglomerate Notification Banner */}
      {targetConglomerate && (
        <div
          style={{
            background: "var(--primary-subtle)",
            border: "1px solid var(--primary-light)",
            borderRadius: "var(--radius-lg)",
            padding: "12px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            marginBottom: "var(--space-4)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Crown size={18} color="var(--primary-dark)" />
            <span style={{ fontSize: "var(--text-sm)", color: "var(--text)" }}>
              {lang === "id" ? "Menampilkan berkas konglomerasi untuk:" : "Viewing dossier for:"}{" "}
              <strong style={{ color: "var(--primary-dark)" }}>{targetConglomerate.name}</strong>{" "}
              ({targetConglomerate.tycoon})
            </span>
          </div>
          <Link
            href="/conglomerates"
            className="btn btn-outline btn-xs"
            style={{ fontSize: "11px", gap: 4 }}
          >
            <X size={12} />
            <span>{lang === "id" ? "Tampilkan Semua" : "View All"}</span>
          </Link>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchBox}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder={
              lang === "id"
                ? "Cari konglomerasi, nama taipan (Salim, Katuari, Hartono), atau kode saham (ICBP, MYOR)..."
                : "Search conglomerate, tycoon, or ticker..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {sectors.map((s) => (
            <button
              key={s}
              type="button"
              className={`btn btn-xs ${selectedSector === s ? "btn-primary" : "btn-outline"}`}
              onClick={() => setSelectedSector(s)}
              style={{ fontSize: 11, padding: "6px 12px", borderRadius: 999 }}
            >
              {s === "all" ? (lang === "id" ? "Semua Sektor" : "All Sectors") : s}
            </button>
          ))}
        </div>
      </div>

      {/* Conglomerate Grid */}
      <div className={styles.grid}>
        {filtered.map((c) => {
          const groupBrands = brandsByConglomerate.get(c.id) || [];
          const isTargeted = targetId === c.id;

          return (
            <div
              key={c.id}
              id={c.id}
              className={styles.card}
              style={
                isTargeted
                  ? {
                      borderColor: "var(--primary)",
                      boxShadow: "0 0 0 3px rgba(13, 148, 136, 0.25), var(--shadow-md)",
                    }
                  : undefined
              }
            >
              <div className={styles.cardHeader}>
                <div>
                  <h2 className={styles.groupName}>{c.name}</h2>
                  <div className={styles.tycoonLine}>
                    <Crown size={13} color="var(--primary)" />
                    <span>{lang === "id" ? "Taipan / Pengendali:" : "Tycoon / Controller:"}</span>
                    <span className={styles.tycoonName}>{c.tycoon}</span>
                  </div>
                </div>
                {c.powerMapRank && (
                  <span className={styles.powerBadge}>
                    <ShieldAlert size={12} />
                    Power200 #{c.powerMapRank}
                  </span>
                )}
              </div>

              <p className={styles.desc}>
                {lang === "id" ? c.descriptionId : c.description}
              </p>

              <div className={styles.metaRow}>
                {c.listedEntities.map((t) => (
                  <span key={t} className={styles.tickerTag}>
                    BEI: {t}
                  </span>
                ))}
                {c.keySectors.map((s) => (
                  <span key={s} className={styles.sectorTag}>
                    {s}
                  </span>
                ))}
                <span className={styles.sectorTag} style={{ marginLeft: "auto" }}>
                  📍 {c.headquarters}
                </span>
              </div>

              {/* Brands Catalog */}
              <div className={styles.brandsSection}>
                <div className={styles.brandsTitle}>
                  {lang === "id"
                    ? `Brand di Bijak Beli (${groupBrands.length})`
                    : `Brands in Bijak Beli (${groupBrands.length})`}
                </div>
                {groupBrands.length > 0 ? (
                  <div className={styles.brandChips}>
                    {groupBrands.map((b) => (
                      <Link
                        key={b.id}
                        href={`/brand/${b.id}`}
                        className={styles.brandChip}
                        title={lang === "id" ? b.taglineId : b.tagline}
                      >
                        <span>{b.name}</span>
                        <ArrowRight size={10} />
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: 12, color: "var(--text-muted)", fontStyle: "italic" }}>
                    {lang === "id"
                      ? "Sedang dalam proses pemetaan katalog produk ritel."
                      : "Catalog mapping in progress."}
                  </p>
                )}
              </div>

              <div className={styles.cardFooter}>
                <span style={{ color: "var(--text-muted)" }}>
                  {lang === "id" ? "Peta Relasi Kekuasaan:" : "Power Relationship:"}
                </span>
                <Link
                  href={`/power?q=${encodeURIComponent(c.name.split(" ")[0])}`}
                  className={styles.powerLink}
                >
                  <span>{lang === "id" ? "Telusuri di LittleSis" : "Explore on LittleSis"}</span>
                  <ExternalLink size={12} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ConglomeratesPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: "4rem 0", textAlign: "center", color: "var(--text-muted)" }}>
          Memuat Direktori Konglomerasi…
        </div>
      }
    >
      <ConglomeratesContent />
    </Suspense>
  );
}
