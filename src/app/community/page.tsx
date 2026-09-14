"use client";

import { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { TrendingUp, Flag, ThumbsUp, BarChart2, Users, MessageCircle } from "lucide-react";
import { useApp } from "@/components/AppProvider";
import { fetchAllBrands } from "@/lib/api";
import type { Brand } from "@/lib/types";
import { calculateAlignment } from "@/lib/scoring";
import styles from "./community.module.css";

export default function CommunityPage() {
  const { lang, prefs } = useApp();
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [brands, setBrands] = useState<Brand[]>([]);

  useEffect(() => { 
    fetchAllBrands().then(setBrands).catch(console.error);
  }, []);

  if (!mounted) return null;

  const boycottBrands = brands.filter((b) => b.boycottActive);
  const mostVoted = [...brands].sort((a, b) => (b.communityVotes.up + b.communityVotes.down) - (a.communityVotes.up + a.communityVotes.down)).slice(0, 8);
  const highScore = [...brands].sort((a, b) => calculateAlignment(b, prefs.weights).score - calculateAlignment(a, prefs.weights).score).slice(0, 4);
  const lowScore = [...brands].sort((a, b) => calculateAlignment(a, prefs.weights).score - calculateAlignment(b, prefs.weights).score).slice(0, 4);

  return (
    <div className={styles.page}>
      <div className="container">
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>
            {lang === "id" ? "Komunitas" : "Community"}
          </h1>
          <p className={styles.subtitle}>
            {lang === "id"
              ? "Sentimen komunitas, brand yang sedang dibahas, dan tren boikot terkini."
              : "Community sentiment, trending brands, and latest boycott trends."}
          </p>
        </div>

        {/* Stats bar */}
        <div className={styles.statsRow}>
          {[
            { icon: <Users size={18} />, val: "50K+", label: lang === "id" ? "Pengguna aktif" : "Active users" },
            { icon: <ThumbsUp size={18} />, val: brands.reduce((a, b) => a + b.communityVotes.up, 0).toLocaleString(), label: lang === "id" ? "Total vote positif" : "Total positive votes" },
            { icon: <Flag size={18} />, val: boycottBrands.length.toString(), label: lang === "id" ? "Brand diboikot" : "Boycotted brands" },
            { icon: <BarChart2 size={18} />, val: brands.length + "+", label: lang === "id" ? "Brand terdaftar" : "Brands tracked" },
          ].map((s, i) => (
            <div key={i} className={`card card-body ${styles.statCard}`}>
              <div className={styles.statIcon}>{s.icon}</div>
              <div className={styles.statVal}>{s.val}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Active boycotts */}
        <section className={styles.section}>
          <h2 className="section-title">
            <Flag size={18} color="var(--score-poor)" />
            {lang === "id" ? "Brand Aktif Diboikot" : "Actively Boycotted Brands"}
          </h2>
          {boycottBrands.length === 0 ? (
            <p className={styles.empty}>{lang === "id" ? "Tidak ada brand yang sedang diboikot." : "No brands are currently being boycotted."}</p>
          ) : (
            <div className={styles.boycottGrid}>
              {boycottBrands.map((brand) => (
                <Link key={brand.id} href={`/brand/${brand.id}`} className={`card card-body ${styles.boycottCard}`}>
                  <div className={styles.boycottTop}>
                    <div className={styles.logoWrap}>
                      <span className={styles.logoLetter}>{brand.name[0]}</span>
                    </div>
                    <div>
                      <div className={styles.brandName}>{brand.name}</div>
                      <div className={styles.brandParent}>{brand.parentCompany}</div>
                    </div>
                  </div>
                  <p className={styles.boycottReason}>
                    {lang === "id" ? brand.boycottReasonId : brand.boycottReason}
                  </p>
                  <div className={styles.boycottMeta}>
                    <span className="badge badge-boycott">
                      <Flag size={10} />
                      {lang === "id" ? "Diboikot" : "Boycotted"}
                    </span>
                    <span className={styles.votes}>
                      👎 {brand.communityVotes.down.toLocaleString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Most voted */}
        <section className={styles.section}>
          <h2 className="section-title">
            <MessageCircle size={18} />
            {lang === "id" ? "Paling Banyak Dibahas" : "Most Discussed"}
          </h2>
          <div className={styles.votedList}>
            {mostVoted.map((brand, i) => {
              const total = brand.communityVotes.up + brand.communityVotes.down;
              const upPct = Math.round((brand.communityVotes.up / total) * 100);
              const score = calculateAlignment(brand, prefs.weights).score;
              return (
                <Link key={brand.id} href={`/brand/${brand.id}`} className={`card card-body ${styles.votedItem}`}>
                  <span className={styles.rank}>#{i + 1}</span>
                  <div className={styles.votedLogoWrap}>
                    <span className={styles.votedLogo}>{brand.name[0]}</span>
                  </div>
                  <div className={styles.votedInfo}>
                    <div className={styles.votedName}>{brand.name}</div>
                    <div className="score-bar-track" style={{ marginTop: "var(--space-1)" }}>
                      <div
                        className="score-bar-fill"
                        style={{
                          width: `${upPct}%`,
                          background: upPct >= 60 ? "var(--score-excellent)" : upPct >= 40 ? "var(--score-fair)" : "var(--score-poor)",
                        }}
                      />
                    </div>
                  </div>
                  <div className={styles.votedStats}>
                    <span className={styles.votedPct} style={{ color: upPct >= 60 ? "var(--score-excellent)" : upPct >= 40 ? "var(--score-fair)" : "var(--score-poor)" }}>
                      {upPct}%
                    </span>
                    <span className={styles.votedTotal}>{total.toLocaleString()}</span>
                  </div>
                  <div className={styles.votedScore}>{score}</div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* High/Low score */}
        <div className={styles.compareGrid}>
          <section>
            <h2 className="section-title" style={{ fontSize: "var(--text-base)" }}>
              <TrendingUp size={16} color="var(--score-excellent)" />
              {lang === "id" ? "Skor Tertinggi" : "Highest Scores"}
            </h2>
            <div className={styles.rankList}>
              {highScore.map((brand) => {
                const result = calculateAlignment(brand, prefs.weights);
                return (
                  <Link key={brand.id} href={`/brand/${brand.id}`} className={`card card-body ${styles.rankItem}`}>
                    <div className={styles.rankLogoWrap}>
                      <span style={{ fontWeight: 800, color: "var(--primary)" }}>{brand.name[0]}</span>
                    </div>
                    <span className={styles.rankName}>{brand.name}</span>
                    <span className={styles.rankScore} style={{ color: "var(--score-excellent)" }}>
                      {result.score} {result.grade}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="section-title" style={{ fontSize: "var(--text-base)" }}>
              <TrendingUp size={16} color="var(--score-poor)" style={{ transform: "scaleY(-1)" }} />
              {lang === "id" ? "Skor Terendah" : "Lowest Scores"}
            </h2>
            <div className={styles.rankList}>
              {lowScore.map((brand) => {
                const result = calculateAlignment(brand, prefs.weights);
                return (
                  <Link key={brand.id} href={`/brand/${brand.id}`} className={`card card-body ${styles.rankItem}`}>
                    <div className={styles.rankLogoWrap}>
                      <span style={{ fontWeight: 800, color: "var(--score-poor)" }}>{brand.name[0]}</span>
                    </div>
                    <span className={styles.rankName}>{brand.name}</span>
                    <span className={styles.rankScore} style={{ color: "var(--score-poor)" }}>
                      {result.score} {result.grade}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
