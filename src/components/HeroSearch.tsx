"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Camera, X, ArrowRight, Sparkles } from "lucide-react";
import ScannerModal from "./ScannerModal";
import styles from "../app/home.module.css";

interface HeroSearchProps {
  lang: string;
}

const POPULAR_SEARCHES = [
  { label: "Indomie", q: "Indomie" },
  { label: "Aqua", q: "Aqua" },
  { label: "Le Minerale", q: "Le Minerale" },
  { label: "Mie Sedaap", q: "Mie Sedaap" },
  { label: "Unilever", q: "Unilever" },
  { label: "Mayora", q: "Mayora" },
];

export default function HeroSearch({ lang }: HeroSearchProps) {
  const [query, setQuery] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const router = useRouter();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  function handleQuickTag(q: string) {
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <div className={styles.heroSearchContainer}>
      <form onSubmit={handleSearch} className={styles.heroSearch}>
        <div className={styles.heroSearchWrap}>
          <Search size={22} className={styles.heroSearchIcon} />
          <input
            id="hero-search"
            type="search"
            className={styles.heroSearchInput}
            placeholder={
              lang === "id"
                ? "Ketik brand, emiten, atau taipan... (cth: Indomie, Aqua, Salim)"
                : "Search brand, ticker, or tycoon... (e.g. Indomie, Aqua, Salim)"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
          />

          {query && (
            <button
              type="button"
              className={styles.heroClearBtn}
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}

          <button
            type="button"
            className={styles.heroScanBtn}
            onClick={() => setScannerOpen(true)}
            title={lang === "id" ? "Scan Barcode Produk" : "Scan Product Barcode"}
          >
            <Camera size={18} />
            <span className={styles.heroScanBtnText}>{lang === "id" ? "Scan" : "Scan"}</span>
          </button>

          <button type="submit" className={`btn btn-primary ${styles.heroSearchBtn}`}>
            <span>{lang === "id" ? "Cari" : "Search"}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </form>

      {/* Popular quick tags */}
      <div className={styles.heroQuickTags}>
        <div className={styles.heroQuickTagsLabel}>
          <Sparkles size={13} />
          <span>{lang === "id" ? "Pencarian Cepat:" : "Trending Searches:"}</span>
        </div>
        <div className={styles.heroChipsList}>
          {POPULAR_SEARCHES.map((item) => (
            <button
              key={item.label}
              type="button"
              className={styles.heroChip}
              onClick={() => handleQuickTag(item.q)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <ScannerModal isOpen={scannerOpen} onClose={() => setScannerOpen(false)} />
    </div>
  );
}
