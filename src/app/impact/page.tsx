"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Leaf, Users, ArrowLeft, ShieldCheck,
  TrendingUp, Award, Zap, Share2, Trash2
} from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { fetchBrandById } from "@/lib/api";
import type { Brand } from "@/lib/types";
import styles from "./impact.module.css";

export default function ImpactPage() {
  const { prefs, lang, clearPurchases, t } = useApp();
  const [purchases, setPurchases] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!prefs.purchaseIds || (prefs.purchaseIds?.length || 0) === 0) {
        setPurchases([]);
        setLoading(false);
        return;
      }
      const loaded = await Promise.all((prefs.purchaseIds || []).map(id => fetchBrandById(id)));
      setPurchases(loaded.filter(Boolean) as Brand[]);
      setLoading(false);
    }
    load();
  }, [prefs.purchaseIds]);

  if (loading) return <div className="container" style={{padding: '4rem 0'}}>{t("common", "loading")}</div>;

  // Calculate stats
  const totalItems = purchases.length;
  const avgEthical = purchases.length > 0 ? purchases.reduce((a, b) => a + b.scores.ethical, 0) / purchases.length : 0;
  const avgEsg = purchases.length > 0 ? purchases.reduce((a, b) => a + b.scores.esg, 0) / purchases.length : 0;
  const localCount = purchases.filter(p => p.country === "ID" || p.country === "Indonesia").length;
  const localPct = totalItems > 0 ? Math.round((localCount / totalItems) * 100) : 0;

  // Mock impact metrics
  const kgCarbonSaved = (avgEsg / 100) * totalItems * 0.5;
  const communityPoints = totalItems * 10 + Math.round(avgEthical);

  if (totalItems === 0) {
    return (
      <div className="container" style={{padding: '4rem 0', textAlign: 'center'}}>
        <div className="card card-body" style={{maxWidth: '480px', margin: '0 auto'}}>
          <Award size={64} color="var(--primary-light)" style={{marginBottom: '1.5rem'}} />
          <h1>{lang === "id" ? "Mulai Dampak Positifmu" : "Start Your Positive Impact"}</h1>
          <p style={{marginBottom: '2rem', color: 'var(--text-secondary)'}}>
            {lang === "id" 
              ? "Catat setiap kali Anda membeli brand dengan skor tinggi untuk melihat kontribusi Anda terhadap konsumsi etis." 
              : "Record every time you buy a high-scoring brand to see your contribution to ethical consumption."}
          </p>
          <Link href="/search" className="btn btn-primary btn-lg">
            {t("nav", "search")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={16} />
            {t("nav", "home")}
          </Link>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>
                {lang === "id" ? "Dampak Saya" : "My Impact"}
              </h1>
              <p className={styles.subtitle}>
                {lang === "id" 
                  ? "Kontribusi Anda terhadap dunia yang lebih bijak" 
                  : "Your contribution to a wiser world"}
              </p>
            </div>
            <div className={styles.headerActions}>
              <button className="btn btn-ghost" onClick={() => {
                if(confirm(lang === "id" ? "Hapus semua riwayat?" : "Clear all history?")) clearPurchases();
              }}>
                <Trash2 size={16} />
              </button>
              <button className="btn btn-outline btn-sm">
                <Share2 size={16} />
                {lang === "id" ? "Bagikan" : "Share"}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={`card card-body ${styles.statCard}`}>
            <div className={styles.statIcon} style={{background: '#DCFCE7', color: '#15803D'}}>
              <Leaf size={24} />
            </div>
            <div className={styles.statVal}>{kgCarbonSaved.toFixed(1)}kg</div>
            <div className={styles.statLabel}>{lang === "id" ? "CO₂ Dikurangi (Est.)" : "CO₂ Reduced (Est.)"}</div>
          </div>

          <div className={`card card-body ${styles.statCard}`}>
            <div className={styles.statIcon} style={{background: '#DBEAFE', color: '#1E40AF'}}>
              <Users size={24} />
            </div>
            <div className={styles.statVal}>{localPct}%</div>
            <div className={styles.statLabel}>{lang === "id" ? `Produk Lokal (${localCount} dari ${totalItems})` : `Local Products (${localCount} of ${totalItems})`}</div>
          </div>

          <div className={`card card-body ${styles.statCard}`}>
            <div className={styles.statIcon} style={{background: '#FEF3C7', color: '#92400E'}}>
              <Award size={24} />
            </div>
            <div className={styles.statVal}>{communityPoints}</div>
            <div className={styles.statLabel}>{lang === "id" ? "Poin Dampak" : "Impact Points"}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainLayout}>
          <div className={styles.left}>
            {/* Visual Chart Mock */}
            <div className={`card card-body ${styles.chartCard}`}>
              <h2 className={styles.sectionTitle}>
                <TrendingUp size={18} />
                {lang === "id" ? "Pertumbuhan Nilai" : "Value Growth"}
              </h2>
              <div className={styles.mockChart}>
                <div className={styles.chartBar} style={{height: '40%'}} />
                <div className={styles.chartBar} style={{height: '60%'}} />
                <div className={styles.chartBar} style={{height: '55%'}} />
                <div className={styles.chartBar} style={{height: '80%'}} />
                <div className={styles.chartBar} style={{height: '95%', background: 'var(--primary)'}} />
              </div>
              <p className={styles.chartHint}>
                {lang === "id" 
                  ? "Rata-rata skor etika belanjaan Anda naik 15% bulan ini." 
                  : "Your average ethical shopping score is up 15% this month."}
              </p>
            </div>

            {/* Recent Purchases */}
            <div className={`card card-body ${styles.historyCard}`}>
              <h2 className={styles.sectionTitle}>
                {lang === "id" ? "Riwayat Belanja Bijak" : "Wise Shopping History"}
              </h2>
              <div className={styles.historyList}>
                {purchases.slice().reverse().map((brand, i) => (
                  <div key={`${brand.id}-${i}`} className={styles.historyItem}>
                    <div className={styles.historyLogo}>{brand.name[0]}</div>
                    <div className={styles.historyInfo}>
                      <div className={styles.historyName}>{brand.name}</div>
                      <div className={styles.historyDate}>{brand.category}</div>
                    </div>
                    <div className={styles.historyScore}>
                      <ShieldCheck size={14} color="var(--primary)" />
                      <span>{Math.round(brand.scores.ethical)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.right}>
             {/* Badge Collection */}
             <div className={`card card-body ${styles.badgeCard}`}>
                <h3 className={styles.sideTitle}>{lang === "id" ? "Pencapaian" : "Badges"}</h3>
                <div className={styles.badgeGrid}>
                  <div className={styles.badgeItem} title="Support local products">🇮🇩</div>
                  <div className={styles.badgeItem} title="High ethical average">💎</div>
                  <div className={styles.badgeItem} title="10+ products scanned">🔍</div>
                  <div className={styles.badgeItem} style={{opacity: 0.3}}>🌱</div>
                  <div className={styles.badgeItem} style={{opacity: 0.3}}>🤝</div>
                </div>
             </div>

             {/* Tips */}
             <div className={`card card-body ${styles.tipsCard}`}>
                <div className={styles.tipsHeader}>
                  <Zap size={16} color="var(--warning)" />
                  <h4>{lang === "id" ? "Saran Bijak" : "Wise Tip"}</h4>
                </div>
                <p>
                  {avgEthical < 70 
                    ? (lang === "id" 
                        ? "Coba cari alternatif untuk produk perawatan diri Anda. Skor etika kategori ini masih bisa ditingkatkan." 
                        : "Try finding alternatives for your personal care products. This category's ethical score can be improved.")
                    : (lang === "id"
                        ? "Luar biasa! Belanjaan Anda sangat selaras dengan nilai kemanusiaan."
                        : "Excellent! Your shopping is highly aligned with humanitarian values.")}
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
