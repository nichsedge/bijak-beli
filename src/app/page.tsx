"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, TrendingUp, Shield, Users, ChevronRight, Star, Zap } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import BrandCard from "@/components/BrandCard";
import { brands, trendingBrands } from "@/data/brands";
import { categories } from "@/data/categories";
import { PRESET_PROFILES } from "@/lib/types";
import styles from "./home.module.css";

export default function HomePage() {
  const { lang, setPreset, prefs } = useApp();
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => { setMounted(true); }, []);

  const trending = trendingBrands
    .map((id) => brands.find((b) => b.id === id))
    .filter(Boolean) as typeof brands;

  const boycottBrands = brands.filter((b) => b.boycottActive).slice(0, 4);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  if (!mounted) return null;

  const strings = {
    id: {
      heroTitle: "Belanja Lebih Bijak,",
      heroHighlight: "Sesuai Nilaimu",
      heroSub: "Kenali siapa di balik brand yang kamu beli. Evaluasi berbasis data: halal, etika, ESG, dan netralitas politik.",
      heroCta: "Cek Brand Sekarang",
      heroCtaSub: "Atur Preferensi Saya",
      trending: "Brand Trending",
      boycott: "Brand yang Diboikot",
      categories: "Telusuri Kategori",
      community: "Sentimen Komunitas",
      setupTitle: "Sesuaikan Skormu",
      setupSub: "Pilih preset atau atur bobot nilai secara manual",
      statsTitle: "Data Bijak Beli",
      stats: ["Brand terdaftar", "Sumber verifikasi", "Pengguna aktif"] as [string, string, string],
    },
    en: {
      heroTitle: "Shop Smarter,",
      heroHighlight: "Aligned with Your Values",
      heroSub: "Know who's behind the brands you buy. Data-driven evaluation: halal, ethics, ESG, and political neutrality.",
      heroCta: "Check a Brand",
      heroCtaSub: "Set My Preferences",
      trending: "Trending Brands",
      boycott: "Boycotted Brands",
      categories: "Browse Categories",
      community: "Community Sentiment",
      setupTitle: "Personalize Your Scores",
      setupSub: "Pick a preset or fine-tune manually",
      statsTitle: "Bijak Beli Data",
      stats: ["Brands tracked", "Verified sources", "Active users"] as [string, string, string],
    },
  };
  const t = strings[lang];


  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <Zap size={12} />
              {lang === "id" ? "Transparansi Brand #1 Indonesia" : "#1 Brand Transparency Platform in Indonesia"}
            </div>

            <h1 className={styles.heroTitle}>
              {t.heroTitle}
              <br />
              <span className="text-gradient">{t.heroHighlight}</span>
            </h1>

            <p className={styles.heroSub}>{t.heroSub}</p>

            <form onSubmit={handleSearch} className={styles.heroSearch}>
              <div className={styles.heroSearchWrap}>
                <Search size={20} className={styles.heroSearchIcon} />
                <input
                  id="hero-search"
                  type="search"
                  className={styles.heroSearchInput}
                  placeholder={lang === "id" ? "Cari brand atau produk... contoh: Indomie, Starbucks" : "Search brand or product... e.g. Indomie, Starbucks"}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
                <button type="submit" className={`btn btn-primary ${styles.heroSearchBtn}`}>
                  {lang === "id" ? "Cek" : "Check"}
                </button>
              </div>
            </form>

            <div className={styles.heroActions}>
              <Link href="/values" className="btn btn-outline">
                {t.heroCtaSub}
              </Link>
              <Link href="/about" className="btn btn-ghost">
                {lang === "id" ? "Bagaimana cara kerjanya?" : "How does it work?"}
              </Link>
            </div>
          </div>

          {/* Hero visual — stats */}
          <div className={styles.heroVisual}>
            <div className={styles.statsGrid}>
              {[
                { val: brands.length + "+", label: t.stats[0], icon: <Shield size={20} /> },
                { val: "200+", label: t.stats[1], icon: <Star size={20} /> },
                { val: "50K+", label: t.stats[2], icon: <Users size={20} /> },
              ].map((s, i) => (
                <div key={i} className={styles.statCard}>
                  <div className={styles.statIcon}>{s.icon}</div>
                  <div className={styles.statVal}>{s.val}</div>
                  <div className={styles.statLabel}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Boycott alert panel */}
            <div className={styles.alertPanel}>
              <div className={styles.alertPanelHeader}>
                <TrendingUp size={14} />
                {lang === "id" ? "Sedang diboikot" : "Currently boycotted"}
              </div>
              {boycottBrands.slice(0, 3).map((b) => (
                <Link key={b.id} href={`/brand/${b.id}`} className={styles.alertItem}>
                  <span className={styles.alertName}>{b.name}</span>
                  <div className={styles.alertPill}>
                    <span style={{ color: "var(--score-poor)", fontWeight: 700, fontSize: "var(--text-xs)" }}>
                      {b.scores.political}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Value presets setup strip */}
      <section className={styles.presetSection}>
        <div className="container">
          <div className={styles.presetInner}>
            <div className={styles.presetLeft}>
              <h2 className={styles.presetTitle}>{t.setupTitle}</h2>
              <p className={styles.presetSub}>{t.setupSub}</p>
            </div>
            <div className={styles.presets}>
              {Object.entries(PRESET_PROFILES).map(([key, profile]) => (
                <button
                  key={key}
                  className={`${styles.presetChip} ${prefs.preset === key ? styles.presetActive : ""}`}
                  onClick={() => setPreset(key)}
                >
                  {lang === "id" ? profile.labelId : profile.label}
                </button>
              ))}
              <Link href="/values" className={`${styles.presetChip} ${styles.presetCustom}`}>
                ⚙ {lang === "id" ? "Kustomisasi" : "Customize"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Brands */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2 className="section-title">{t.trending}</h2>
            <Link href="/search" className={styles.viewAll}>
              {lang === "id" ? "Lihat semua" : "View all"} <ChevronRight size={14} />
            </Link>
          </div>
          <div className="carousel">
            {trending.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className="container">
          <h2 className="section-title">{t.categories}</h2>
          <div className={styles.categoryGrid}>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/search?category=${cat.id}`}
                className={`card ${styles.categoryCard}`}
              >
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <div className={styles.categoryInfo}>
                  <span className={styles.categoryName}>
                    {lang === "id" ? cat.nameId : cat.name}
                  </span>
                  <span className={styles.categoryCount}>
                    {cat.brandCount} {lang === "id" ? "brand" : "brands"}
                  </span>
                </div>
                <ChevronRight size={16} className={styles.categoryArrow} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Community pulse */}
      <section className={styles.section}>
        <div className="container">
          <h2 className="section-title">{t.community}</h2>
          <div className={styles.communityCards}>
            {brands
              .sort((a, b) => (b.communityVotes.up + b.communityVotes.down) - (a.communityVotes.up + a.communityVotes.down))
              .slice(0, 6)
              .map((brand) => {
                const total = brand.communityVotes.up + brand.communityVotes.down;
                const upPct = Math.round((brand.communityVotes.up / total) * 100);
                return (
                  <Link key={brand.id} href={`/brand/${brand.id}`} className={`card ${styles.communityCard}`}>
                    <div className={styles.communityCardTop}>
                      <div className={styles.communityLogoWrap}>
                        <span className={styles.communityLogo}>{brand.name[0]}</span>
                      </div>
                      <div>
                        <div className={styles.communityName}>{brand.name}</div>
                        <div className={styles.communityVotes}>
                          {total.toLocaleString()} {lang === "id" ? "suara" : "votes"}
                        </div>
                      </div>
                      <div className={styles.communityPctBadge} style={{
                        color: upPct >= 60 ? "var(--score-excellent)" : upPct >= 40 ? "var(--score-fair)" : "var(--score-poor)"
                      }}>
                        {upPct}%
                      </div>
                    </div>
                    <div className="score-bar-track">
                      <div
                        className="score-bar-fill"
                        style={{
                          width: `${upPct}%`,
                          background: upPct >= 60 ? "var(--score-excellent)" : upPct >= 40 ? "var(--score-fair)" : "var(--score-poor)",
                        }}
                      />
                    </div>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className={styles.ctaBanner}>
        <div className="container">
          <div className={styles.ctaInner}>
            <div>
              <h2 className={styles.ctaTitle}>
                {lang === "id" ? "Mulai belanja dengan lebih bijak" : "Start shopping more wisely"}
              </h2>
              <p className={styles.ctaSub}>
                {lang === "id"
                  ? "Atur profil nilai Anda dan dapatkan rekomendasi yang dipersonalisasi"
                  : "Set your value profile and get personalized recommendations"}
              </p>
            </div>
            <Link href="/values" className="btn btn-primary btn-lg">
              {lang === "id" ? "Atur Nilai Saya" : "Set My Values"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
