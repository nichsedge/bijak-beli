"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Filter, ChevronDown } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import BrandCard from "@/components/BrandCard";
import { fetchAllBrands, fetchCategories } from "@/lib/api";
import { sortBrands } from "@/lib/scoring";
import type { Brand, Category } from "@/lib/types";
import styles from "./search.module.css";

function SearchContent() {
  const searchParams = useSearchParams();
  const { lang, prefs } = useApp();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "all");
  const [sortBy, setSortBy] = useState<"score" | "name" | "votes">("score");
  const [filterHalal, setFilterHalal] = useState(false);
  const [filterBoycott, setFilterBoycott] = useState<"all" | "active" | "none">("all");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [allB, allC] = await Promise.all([fetchAllBrands(), fetchCategories()]);
      setBrands(allB);
      setCategories(allC);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    setQuery(searchParams.get("q") ?? "");
    const cat = searchParams.get("category");
    if (cat) setCategory(cat);
  }, [searchParams]);

  // Filter brands locally
  const queryLower = query.toLowerCase();
  
  let results: Brand[] = [...brands];
  
  if (queryLower) {
    results = results.filter(b => 
      b.name.toLowerCase().includes(queryLower) ||
      b.parentCompany?.toLowerCase().includes(queryLower) ||
      b.category.toLowerCase().includes(queryLower)
    );
  } else if (category !== "all") {
    results = results.filter(b => b.category === category);
  }

  if (filterHalal) results = results.filter((b) => b.halalCertified);
  if (filterBoycott === "active") results = results.filter((b) => b.boycottActive);
  if (filterBoycott === "none") results = results.filter((b) => !b.boycottActive);

  // Sort
  if (sortBy === "score") results = sortBrands(results, prefs.weights);
  else if (sortBy === "name") results = [...results].sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === "votes") results = [...results].sort((a, b) => (b.communityVotes.up + b.communityVotes.down) - (a.communityVotes.up + a.communityVotes.down));

  const title: Record<string, { id: string; en: string }> = {
    "food-beverage": { id: "Makanan & Minuman", en: "Food & Beverage" },
    "personal-care": { id: "Perawatan Diri", en: "Personal Care" },
    fashion: { id: "Mode & Pakaian", en: "Fashion & Apparel" },
    technology: { id: "Teknologi", en: "Technology" },
    transportation: { id: "Transportasi", en: "Transportation" },
    finance: { id: "Keuangan", en: "Finance" },
    all: { id: "Semua Brand", en: "All Brands" },
  };

  const pageTitle = query
    ? `${lang === "id" ? "Hasil untuk" : "Results for"} "${query}"`
    : title[category]?.[lang] ?? (lang === "id" ? "Telusuri Brand" : "Browse Brands");

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Search bar */}
        <div className={styles.searchBar}>
          <div className={styles.searchWrap}>
            <Search size={18} className={styles.searchIcon} />
            <input
              id="search-main"
              type="search"
              className={`input ${styles.searchInput}`}
              placeholder={lang === "id" ? "Cari brand atau produk..." : "Search brands or products..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoComplete="off"
            />
          </div>
        </div>

        {/* Category pills */}
        <div className={styles.categoryPills}>
          {[{ id: "all", name: lang === "id" ? "Semua" : "All", nameId: "Semua" }, ...categories].map((cat) => (
            <button
              key={cat.id}
              className={`${styles.categoryPill} ${category === cat.id ? styles.pillActive : ""}`}
              onClick={() => setCategory(cat.id)}
            >
              {"icon" in cat ? cat.icon : ""} {lang === "id" ? cat.nameId : cat.name}
            </button>
          ))}
        </div>

        {/* Results header */}
        <div className={styles.resultsHeader}>
          <h1 className={styles.title}>{pageTitle}</h1>
          <div className={styles.controls}>
            <div className={styles.sortWrap}>
              <label className={styles.sortLabel}>{lang === "id" ? "Urutkan:" : "Sort:"}</label>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              >
                <option value="score">{lang === "id" ? "Skor Tertinggi" : "Highest Score"}</option>
                <option value="name">{lang === "id" ? "Nama A-Z" : "Name A-Z"}</option>
                <option value="votes">{lang === "id" ? "Komunitas" : "Community"}</option>
              </select>
            </div>
            <button
              className={`btn btn-ghost btn-sm ${styles.filterBtn}`}
              onClick={() => setFiltersOpen((o) => !o)}
            >
              <Filter size={14} />
              {lang === "id" ? "Filter" : "Filter"}
              <ChevronDown size={14} className={filtersOpen ? styles.rotated : ""} />
            </button>
          </div>
        </div>

        {/* Filter panel */}
        {filtersOpen && (
          <div className={`card card-body ${styles.filterPanel}`}>
            <div className={styles.filterRow}>
              <label className={styles.filterLabel}>
                <input
                  type="checkbox"
                  checked={filterHalal}
                  onChange={(e) => setFilterHalal(e.target.checked)}
                />
                {lang === "id" ? "Tersertifikasi Halal saja" : "Halal certified only"}
              </label>
            </div>
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>{lang === "id" ? "Status boikot:" : "Boycott status:"}</span>
              <div className={styles.filterOptions}>
                {(["all", "active", "none"] as const).map((opt) => (
                  <label key={opt} className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="boycott"
                      value={opt}
                      checked={filterBoycott === opt}
                      onChange={() => setFilterBoycott(opt)}
                    />
                    {opt === "all"
                      ? (lang === "id" ? "Semua" : "All")
                      : opt === "active"
                      ? (lang === "id" ? "Aktif diboikot" : "Actively boycotted")
                      : (lang === "id" ? "Tidak diboikot" : "Not boycotted")}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Count */}
        <p className={styles.count}>
          {results.length} {lang === "id" ? "brand ditemukan" : "brands found"}
        </p>

        {/* Results grid */}
        {results.length > 0 ? (
          <div className={styles.grid}>
            {results.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <Search size={40} color="var(--text-subtle)" />
            <p>{lang === "id" ? "Tidak ada hasil ditemukan" : "No results found"}</p>
            <p className={styles.emptyHint}>
              {lang === "id" ? "Coba kata kunci lain" : "Try a different keyword"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container" style={{ padding: "4rem 0", textAlign: "center" }}>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
