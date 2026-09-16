import Link from "next/link";
import { TrendingUp, Shield, ChevronRight, Star, Zap, Building2, Search } from "lucide-react";
import BrandCard from "@/components/BrandCard";
import HeroSearch from "@/components/HeroSearch";
import PresetSelector from "@/components/PresetSelector";
import { fetchAllBrands, fetchCategories, fetchTrendingBrands } from "@/lib/api";
import styles from "./home.module.css";
import { cookies } from "next/headers";

export default async function HomePage() {
  const cookieStore = await cookies();
  const lang = cookieStore.get("locale")?.value === "en" ? "en" : "id";

  // Fetch DB Data on Server
  const [brands, categories, trending] = await Promise.all([
    fetchAllBrands(),
    fetchCategories(),
    fetchTrendingBrands(),
  ]);

  const boycottBrands = brands.filter((b) => b.boycottActive).slice(0, 4);

  const strings = {
    id: {
      heroTitle: "Belanja Lebih Bijak,",
      heroHighlight: "Sesuai Nilaimu",
      heroSub: "Kenali siapa di balik brand yang kamu beli. Evaluasi berbasis data: halal, etika, ESG, dan netralitas politik.",
      heroCtaSub: "Atur Preferensi Saya",
      trending: "Brand Trending",
      categories: "Telusuri Kategori",
      community: "Sentimen Komunitas",
      setupTitle: "Sesuaikan Skormu",
      setupSub: "Pilih preset atau atur bobot nilai secara manual",
      stats: ["Brand terdaftar", "Sumber verifikasi", "Pengguna aktif"],
    },
    en: {
      heroTitle: "Shop Smarter,",
      heroHighlight: "Aligned with Your Values",
      heroSub: "Know who's behind the brands you buy. Data-driven evaluation: halal, ethics, ESG, and political neutrality.",
      heroCtaSub: "Set My Preferences",
      trending: "Trending Brands",
      categories: "Browse Categories",
      community: "Community Sentiment",
      setupTitle: "Personalize Your Scores",
      setupSub: "Pick a preset or fine-tune manually",
      stats: ["Brands tracked", "Verified sources", "Active users"],
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

            <HeroSearch lang={lang} />

            <div className={styles.heroActions}>
              <Link href="/conglomerates" className="btn btn-outline">
                <Building2 size={16} />
                <span>{lang === "id" ? "Peta 38 Konglomerasi" : "38 Conglomerate Groups"}</span>
              </Link>
              <Link href="/values" className="btn btn-ghost">
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
                { val: brands.length + "+", label: t.stats[0], icon: <Shield size={18} /> },
                { val: "38", label: lang === "id" ? "Grup Konglomerasi" : "Conglomerates", icon: <Building2 size={18} /> },
                { val: "100%", label: lang === "id" ? "Rujukan BEI/BPOM" : "BEI & BPOM Verified", icon: <Star size={18} /> },
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
                <span>{lang === "id" ? "Sorotan Boikot & Transparansi" : "Boycott & Transparency Alerts"}</span>
              </div>
              {boycottBrands.slice(0, 3).map((b) => (
                <Link key={b.id} href={`/brand/${b.id}`} className={styles.alertItem}>
                  <div className={styles.alertItemLeft}>
                    <span className={styles.alertName}>{b.name}</span>
                    <span className={styles.alertParent}>{b.parentCompany}</span>
                  </div>
                  <div className={styles.alertPill}>
                    <span style={{ color: "var(--score-poor)", fontWeight: 700, fontSize: "var(--text-xs)" }}>
                      Skor: {b.scores.political}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Value Proposition: How It Works */}
      <section className={styles.howItWorksSection}>
        <div className="container">
          <div className={styles.howItWorksHeader}>
            <span className={styles.subHeadingBadge}>
              {lang === "id" ? "TRANSPARANSI KONSUMEN" : "CONSUMER TRANSPARENCY"}
            </span>
            <h2 className={styles.howItWorksTitle}>
              {lang === "id"
                ? "3 Langkah Menjadi Konsumen Sadar & Berdaya"
                : "3 Steps to Conscious & Empowered Shopping"}
            </h2>
          </div>

          <div className={styles.stepsGrid}>
            <div className={`card ${styles.stepCard}`}>
              <div className={styles.stepNum}>01</div>
              <div className={styles.stepIconWrap}>
                <Search size={22} color="var(--primary)" />
              </div>
              <h3 className={styles.stepTitle}>
                {lang === "id" ? "Scan Barcode atau Cari Brand" : "Scan Barcode or Search Brand"}
              </h3>
              <p className={styles.stepDesc}>
                {lang === "id"
                  ? "Pindai barcode kemasan produk fisik di minimarket secara instan via kamera atau cari berdasarkan nama merek favorit."
                  : "Scan packaged products in supermarkets instantly via your device camera or search by brand name."}
              </p>
            </div>

            <div className={`card ${styles.stepCard}`}>
              <div className={styles.stepNum}>02</div>
              <div className={styles.stepIconWrap}>
                <Building2 size={22} color="var(--accent)" />
              </div>
              <h3 className={styles.stepTitle}>
                {lang === "id" ? "Ungkap Pemilik Akhir (UBO)" : "Uncover Ultimate Beneficial Owners"}
              </h3>
              <p className={styles.stepDesc}>
                {lang === "id"
                  ? "Lacak anak perusahaan, holding emiten BEI, dinasti taipan, dan peringkat kekuasaan Power200 yang selama ini tersembunyi."
                  : "Trace corporate subsidiaries, listed holding entities, tycoon dynasties, and Power200 ties behind everyday products."}
              </p>
            </div>

            <div className={`card ${styles.stepCard}`}>
              <div className={styles.stepNum}>03</div>
              <div className={styles.stepIconWrap}>
                <Shield size={22} color="var(--score-excellent)" />
              </div>
              <h3 className={styles.stepTitle}>
                {lang === "id" ? "Bandingkan Alternatif Berintegritas" : "Choose Ethical Alternatives"}
              </h3>
              <p className={styles.stepDesc}>
                {lang === "id"
                  ? "Evaluasi skor halal BPJPH, integritas etis, dan netralitas politik. Temukan alternatif produsen lokal yang sejalan dengan nilaimu."
                  : "Evaluate official BPJPH halal certificates, ethical scores, and political neutrality. Discover conscious local alternatives."}
              </p>
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
            <PresetSelector />
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
