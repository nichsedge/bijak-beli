"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Info, Zap, AlertTriangle } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { fetchBrandById } from "@/lib/api";
import { calculateAlignment } from "@/lib/scoring";
import ScoreBadge from "@/components/ScoreBadge";
import type { Brand, AlignmentResult } from "@/lib/types";
import styles from "./compare.module.css";

const DIMENSIONS = [
  { key: "halal", icon: "☪️" },
  { key: "ethical", icon: "🤝" },
  { key: "esg", icon: "🌱" },
  { key: "political", icon: "⚖️" },
  { key: "community", icon: "👥" },
] as const;

export default function ComparePage() {
  const { prefs, lang, clearComparison, t } = useApp();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if ((prefs.compareIds?.length || 0) === 0) {
        setBrands([]);
        setLoading(false);
        return;
      }
      const loaded = await Promise.all((prefs.compareIds || []).map(id => fetchBrandById(id)));
      setBrands(loaded.filter(Boolean) as Brand[]);
      setLoading(false);
    }
    load();
  }, [prefs.compareIds]);

  if (loading) return <div className="container" style={{padding: '4rem 0'}}>Loading...</div>;

  if (brands.length === 0) {
    return (
      <div className="container" style={{padding: '4rem 0', textAlign: 'center'}}>
        <div className="card card-body" style={{maxWidth: '400px', margin: '0 auto'}}>
          <Info size={48} color="var(--text-subtle)" style={{marginBottom: '1rem'}} />
          <h2>{lang === "id" ? "Belum ada brand dipilih" : "No brands selected"}</h2>
          <p>{lang === "id" ? "Pilih minimal 2 brand untuk dibandingkan." : "Select at least 2 brands to compare."}</p>
          <Link href="/search" className="btn btn-primary" style={{marginTop: '1.5rem'}}>
            {lang === "id" ? "Cari Brand" : "Browse Brands"}
          </Link>
        </div>
      </div>
    );
  }

  const comparisons = brands.map(b => ({
    brand: b,
    result: calculateAlignment(b, prefs.weights)
  }));

  // Find the "best" in each category
  const winners: Record<string, string> = {};
  DIMENSIONS.forEach(dim => {
    const sorted = [...comparisons].sort((a, b) => b.brand.scores[dim.key] - a.brand.scores[dim.key]);
    if (sorted[0].brand.scores[dim.key] > sorted[1]?.brand.scores[dim.key] || 100) {
      winners[dim.key] = sorted[0].brand.id;
    }
  });

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <Link href="/search" className={styles.backLink}>
            <ArrowLeft size={16} />
            {lang === "id" ? "Kembali" : "Back"}
          </Link>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>
              {lang === "id" ? "Perbandingan Brand" : "Brand Comparison"}
            </h1>
            <button className="btn btn-ghost btn-sm" onClick={clearComparison}>
              {lang === "id" ? "Hapus Semua" : "Clear All"}
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className={styles.compareGrid} style={{ gridTemplateColumns: `200px repeat(${brands.length}, 1fr)` }}>
          {/* Header Row: Logos & Names */}
          <div className={styles.stickyCol}></div>
          {comparisons.map(({ brand, result }) => (
            <div key={brand.id} className={styles.brandHeader}>
              <div className={styles.logoWrap}>
                <span className={styles.logoLetter}>{brand.name[0]}</span>
              </div>
              <div className={styles.brandName}>{brand.name}</div>
              <div className={styles.brandParent}>{brand.parentCompany}</div>
              <div className={styles.mainScore}>
                <ScoreBadge result={result} size="sm" />
              </div>
            </div>
          ))}

          {/* Dimension Rows */}
          {DIMENSIONS.map(dim => (
            <>
              <div key={`${dim.key}-label`} className={`${styles.stickyCol} ${styles.rowLabel}`}>
                <span className={styles.dimIcon}>{dim.icon}</span>
                {t("scores", dim.key)}
              </div>
              {comparisons.map(({ brand }) => (
                <div key={`${brand.id}-${dim.key}`} className={styles.cell}>
                  <div className={styles.cellScore}>
                    <span className={styles.scoreNum}>{brand.scores[dim.key]}</span>
                    <div className={styles.miniTrack}>
                      <div 
                        className={styles.miniFill} 
                        style={{ 
                          width: `${brand.scores[dim.key]}%`,
                          background: brand.scores[dim.key] >= 80 ? 'var(--score-excellent)' : brand.scores[dim.key] >= 60 ? 'var(--score-good)' : 'var(--score-fair)'
                        }} 
                      />
                    </div>
                  </div>
                  {winners[dim.key] === brand.id && (
                    <div className={styles.winnerBadge}>
                      <Zap size={10} /> {lang === "id" ? "Terbaik" : "Best"}
                    </div>
                  )}
                </div>
              ))}
            </>
          ))}

          {/* Halal Status */}
          <div className={`${styles.stickyCol} ${styles.rowLabel}`}>
             {lang === "id" ? "Sertifikasi Halal" : "Halal Certification"}
          </div>
          {brands.map(b => (
            <div key={`${b.id}-halal`} className={styles.cell}>
              {b.halalCertified ? (
                <div className={styles.statusOk}>
                  <CheckCircle size={16} />
                  <span>{b.halalCertifier || 'Certified'}</span>
                </div>
              ) : (
                <div className={styles.statusBad}>
                  <XCircle size={16} />
                  <span>Not Certified</span>
                </div>
              )}
            </div>
          ))}

          {/* Boycott Status */}
          <div className={`${styles.stickyCol} ${styles.rowLabel}`}>
             {lang === "id" ? "Status Boikot" : "Boycott Status"}
          </div>
          {brands.map(b => (
            <div key={`${b.id}-boycott`} className={styles.cell}>
              {b.boycottActive ? (
                <div className={styles.boycottAlert}>
                  <AlertTriangle size={14} />
                  <span>{lang === "id" ? "Aktif" : "Active"}</span>
                </div>
              ) : (
                <div className={styles.statusOk}>
                  <CheckCircle size={16} />
                  <span>{lang === "id" ? "Tidak Ada" : "None"}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* AI Insight Section */}
        <section className={styles.aiSection}>
          <div className={`card card-body ${styles.aiCard}`}>
            <div className={styles.aiHeader}>
              <div className={styles.aiIcon}>
                <Zap size={20} />
              </div>
              <h2 className={styles.aiTitle}>Bijak Insights (AI)</h2>
            </div>
            
            <div className={styles.aiGrid}>
              {comparisons.map(({ brand, result }) => (
                <div key={brand.id} className={styles.aiItem}>
                  <h3 className={styles.aiBrandName}>{brand.name}</h3>
                  <p className={styles.aiText}>
                    {generateMockInsight(brand, result, lang)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function generateMockInsight(brand: Brand, result: AlignmentResult, lang: string) {
  const isGood = result.score >= 70;
  const dimension = Object.entries(brand.scores).sort((a, b) => b[1] - a[1])[0][0];
  
  if (lang === "id") {
    if (brand.boycottActive) return `${brand.name} saat ini sedang dalam daftar boikot aktif. Pertimbangkan alternatif dengan skor etika yang lebih tinggi untuk keselarasan nilai yang lebih baik.`;
    if (isGood) return `${brand.name} adalah pilihan yang sangat baik bagi Anda, terutama karena kinerjanya yang kuat di bidang ${dimension}.`;
    return `${brand.name} memiliki skor moderat. Fokus utama mereka ada pada ${dimension}, namun ada ruang untuk perbaikan di dimensi lain.`;
  } else {
    if (brand.boycottActive) return `${brand.name} is currently under an active boycott. Consider alternatives with higher ethical scores for better value alignment.`;
    if (isGood) return `${brand.name} is a strong choice for your profile, particularly due to its high performance in ${dimension}.`;
    return `${brand.name} has a moderate alignment. Their main strength is ${dimension}, but there's room for improvement in other areas.`;
  }
}
