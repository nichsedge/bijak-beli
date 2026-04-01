"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ArrowLeft, AlertTriangle, CheckCircle, XCircle,
  Building2, Calendar, Globe, ExternalLink, ThumbsUp, ThumbsDown,
  Shield, Hash, ChevronDown, ChevronUp, Flag
} from "lucide-react";
import { useApp } from "@/components/AppProvider";
import ScoreBadge from "@/components/ScoreBadge";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import BrandCard from "@/components/BrandCard";
import { getBrandById, getAlternatives, brands } from "@/data/brands";
import { controversies } from "@/data/controversies";
import { calculateAlignment } from "@/lib/scoring";
import { formatDate, severityColor, severityLabel } from "@/lib/utils";
import type { Controversy } from "@/lib/types";
import styles from "./brand.module.css";

export default function BrandDetailPage() {
  const params = useParams<{ id: string }>();
  const { prefs, lang } = useApp();
  const [activeTab, setActiveTab] = useState("overview");
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [votes, setVotes] = useState({ up: 0, down: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const brand = getBrandById(params.id);
  if (!brand && mounted) {
    notFound();
  }
  if (!brand) return null;

  const result = calculateAlignment(brand, prefs.weights);
  const alternatives = getAlternatives(brand.alternativeIds);
  const brandControversies: Controversy[] = brand.controversyIds
    .map((id) => controversies.find((c) => c.id === id))
    .filter(Boolean) as Controversy[];

  if (!votes.up && !votes.down) {
    setVotes(brand.communityVotes);
  }

  function handleVote(dir: "up" | "down") {
    if (voted === dir) {
      setVoted(null);
      setVotes((v) => ({ ...v, [dir]: v[dir] - 1 }));
    } else {
      if (voted) setVotes((v) => ({ ...v, [voted]: v[voted] - 1 }));
      setVoted(dir);
      setVotes((v) => ({ ...v, [dir]: v[dir] + 1 }));
    }
  }

  const total = votes.up + votes.down;
  const upPct = total > 0 ? Math.round((votes.up / total) * 100) : 50;

  const tabs = [
    { id: "overview", label: lang === "id" ? "Ringkasan" : "Overview" },
    { id: "transparency", label: lang === "id" ? "Transparansi" : "Transparency" },
    { id: "community", label: lang === "id" ? "Komunitas" : "Community" },
    { id: "alternatives", label: lang === "id" ? "Alternatif" : "Alternatives" },
  ];

  return (
    <div className={styles.page}>
      {/* Boycott banner */}
      {brand.boycottActive && (
        <div className={styles.boycottBanner}>
          <div className="container">
            <div className={styles.boycottContent}>
              <AlertTriangle size={16} />
              <div>
                <strong>{lang === "id" ? "Brand ini aktif diboikot" : "This brand is actively boycotted"}</strong>
                {brand.boycottReasonId && (
                  <p>{lang === "id" ? brand.boycottReasonId : brand.boycottReason}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container">
        {/* Back nav */}
        <Link href="/search" className={styles.backLink}>
          <ArrowLeft size={16} />
          {lang === "id" ? "Kembali ke pencarian" : "Back to search"}
        </Link>

        {/* Brand header */}
        <div className={styles.brandHeader}>
          <div className={styles.brandIdentity}>
            <div className={styles.logoBox}>
              <span className={styles.logoLetter}>{brand.name[0]}</span>
            </div>
            <div className={styles.brandMeta}>
              <h1 className={styles.brandName}>{brand.name}</h1>
              {brand.parentCompany && (
                <div className={styles.parentLine}>
                  <Building2 size={13} />
                  <span>{brand.parentCompany}</span>
                  {brand.ultimateOwner && brand.ultimateOwner !== brand.parentCompany && (
                    <span className={styles.ultimateOwner}>→ {brand.ultimateOwner}</span>
                  )}
                </div>
              )}
              <div className={styles.headerBadges}>
                {brand.halalCertified ? (
                  <span className="badge badge-halal">
                    <CheckCircle size={11} />
                    {lang === "id" ? `Halal ${brand.halalCertifier ?? ""}` : `Halal ${brand.halalCertifier ?? ""}`}
                  </span>
                ) : (
                  <span className="badge" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                    <XCircle size={11} />
                    {lang === "id" ? "Tidak Tersertifikasi Halal" : "No Halal Cert"}
                  </span>
                )}
                {brand.boycottActive && (
                  <span className="badge badge-boycott">
                    <Flag size={11} />
                    {lang === "id" ? "Diboikot" : "Boycotted"}
                  </span>
                )}
                <span className="badge badge-editorial">
                  <Globe size={11} />
                  {brand.country}
                </span>
                {brand.foundedYear && (
                  <span className="badge badge-editorial">
                    <Calendar size={11} />
                    {brand.foundedYear}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Score badge */}
          <div className={styles.scoreSide}>
            <ScoreBadge result={result} size="lg" animate />
            <p className={styles.scoreLabel}>
              {lang === "id" ? "Skor Kesesuaian" : "Alignment Score"}
            </p>
          </div>
        </div>

        {/* Description */}
        <p className={styles.description}>
          {lang === "id" ? brand.descriptionId : brand.description}
        </p>

        {/* Tabs */}
        <div className={`tabs ${styles.tabsWrap}`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className={styles.tabContent}>
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className={styles.overviewGrid}>
              {/* Score breakdown */}
              <div className={`card card-body ${styles.panel}`}>
                <h2 className="section-title" style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-4)" }}>
                  {lang === "id" ? "Rincian Skor" : "Score Breakdown"}
                </h2>
                <ScoreBreakdown brand={brand} weights={prefs.weights} />
              </div>

              {/* Ownership + certifications */}
              <div className={styles.sidePanel}>
                {/* Ownership */}
                <div className={`card card-body ${styles.panel}`}>
                  <h2 className={styles.panelTitle}>
                    <Building2 size={16} />
                    {lang === "id" ? "Struktur Kepemilikan" : "Ownership Structure"}
                  </h2>
                  <div className="ownership-tree">
                    <div className="ownership-node">
                      <div className={styles.ownerBadge}>Brand</div>
                      <span className={styles.ownerName}>{brand.name}</span>
                    </div>
                    {brand.parentCompany && (
                      <>
                        <div className="ownership-connector" />
                        <div className="ownership-node">
                          <div className={styles.ownerBadge} style={{ background: "var(--surface-2)" }}>Parent</div>
                          <span className={styles.ownerName}>{brand.parentCompany}</span>
                        </div>
                      </>
                    )}
                    {brand.ultimateOwner && brand.ultimateOwner !== brand.parentCompany && (
                      <>
                        <div className="ownership-connector" />
                        <div className="ownership-node">
                          <div className={styles.ownerBadge} style={{ background: "var(--primary-subtle)", color: "var(--primary)" }}>Owner</div>
                          <span className={styles.ownerName}>{brand.ultimateOwner}</span>
                          {brand.ownerCountry && (
                            <span className={styles.ownerCountry}>{brand.ownerCountry}</span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Certifications */}
                {brand.certifications.length > 0 && (
                  <div className={`card card-body ${styles.panel}`}>
                    <h2 className={styles.panelTitle}>
                      <Shield size={16} />
                      {lang === "id" ? "Sertifikasi" : "Certifications"}
                    </h2>
                    <div className={styles.certList}>
                      {brand.certifications.map((cert) => (
                        <span key={cert} className={`badge badge-halal ${styles.certBadge}`}>
                          <CheckCircle size={11} />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Controversies summary */}
                {brandControversies.length > 0 && (
                  <div className={`card card-body ${styles.panel}`}>
                    <h2 className={styles.panelTitle}>
                      <AlertTriangle size={16} />
                      {lang === "id" ? "Kontroversi" : "Controversies"} ({brandControversies.length})
                    </h2>
                    <div className={styles.controversyList}>
                      {brandControversies.map((c) => (
                        <div key={c.id} className={styles.controversyItem}>
                          <div
                            className={styles.severityDot}
                            style={{ background: severityColor(c.severity) }}
                          />
                          <div>
                            <div className={styles.controversyTitle}>
                              {lang === "id" ? c.titleId : c.title}
                            </div>
                            <div className={styles.controversyDate}>
                              {formatDate(c.date, lang === "id" ? "id-ID" : "en-US")}
                              <span className={styles.severityLabel} style={{ color: severityColor(c.severity) }}>
                                · {severityLabel(c.severity, lang)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TRANSPARENCY TAB */}
          {activeTab === "transparency" && (
            <div className={styles.transparencyContent}>
              {/* Detailed controversies */}
              <div className={`card card-body ${styles.panel}`}>
                <h2 className={styles.panelTitle}>
                  <Hash size={16} />
                  {lang === "id" ? "Riwayat Kontroversi" : "Controversy Timeline"}
                </h2>
                {brandControversies.length === 0 ? (
                  <div className={styles.emptyState}>
                    <CheckCircle size={32} color="var(--score-excellent)" />
                    <p>{lang === "id" ? "Tidak ada kontroversi tercatat" : "No recorded controversies"}</p>
                  </div>
                ) : (
                  <div className={styles.timeline}>
                    {brandControversies.map((c) => (
                      <div key={c.id} className={styles.timelineItem}>
                        <div className={styles.timelineDate}>
                          {formatDate(c.date, lang === "id" ? "id-ID" : "en-US")}
                        </div>
                        <div
                          className={styles.timelineDot}
                          style={{ background: severityColor(c.severity) }}
                        />
                        <div className={styles.timelineContent}>
                          <div className={styles.timelineHeader}>
                            <h3 className={styles.timelineTitle}>
                              {lang === "id" ? c.titleId : c.title}
                            </h3>
                            <span
                              className="badge"
                              style={{
                                background: `color-mix(in srgb, ${severityColor(c.severity)} 15%, transparent)`,
                                color: severityColor(c.severity),
                                border: `1px solid color-mix(in srgb, ${severityColor(c.severity)} 30%, transparent)`,
                              }}
                            >
                              {severityLabel(c.severity, lang)}
                            </span>
                          </div>
                          <p className={styles.timelineDesc}>
                            {lang === "id" ? c.descriptionId : c.description}
                          </p>
                          <a href={c.sourceUrl} target="_blank" rel="noopener" className={styles.sourceLink}>
                            <ExternalLink size={12} />
                            {c.source}
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Sources */}
              <div className={`card ${styles.panel}`}>
                <button
                  className={styles.sourcesToggle}
                  onClick={() => setSourcesOpen((o) => !o)}
                >
                  <ExternalLink size={16} />
                  {lang === "id" ? "Sumber Data" : "Data Sources"} ({brand.sources.length})
                  {sourcesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {sourcesOpen && (
                  <div className={styles.sourcesList}>
                    {brand.sources.map((src, i) => (
                      <a key={i} href={src.url} target="_blank" rel="noopener" className={styles.sourceItem}>
                        <div>
                          <div className={styles.sourceTitle}>{src.title}</div>
                          <div className={styles.sourceDate}>
                            {formatDate(src.date + "-01", lang === "id" ? "id-ID" : "en-US")}
                          </div>
                        </div>
                        <ExternalLink size={14} className={styles.sourceLinkIcon} />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Last updated */}
              <p className={styles.lastUpdated}>
                <Calendar size={12} />
                {lang === "id" ? "Terakhir diperbarui:" : "Last updated:"}{" "}
                {formatDate(brand.lastUpdated, lang === "id" ? "id-ID" : "en-US")}
              </p>
            </div>
          )}

          {/* COMMUNITY TAB */}
          {activeTab === "community" && (
            <div className={styles.communityContent}>
              <div className={`card card-body ${styles.panel}`}>
                <h2 className={styles.panelTitle}>
                  {lang === "id" ? "Sentimen Komunitas" : "Community Sentiment"}
                </h2>

                <div className={styles.voteDisplay}>
                  <div className={styles.voteBar}>
                    <div
                      className={styles.voteBarUp}
                      style={{ width: `${upPct}%` }}
                    />
                    <div className={styles.voteBarDown} style={{ width: `${100 - upPct}%` }} />
                  </div>
                  <div className={styles.voteNumbers}>
                    <span style={{ color: "var(--score-excellent)" }}>
                      👍 {votes.up.toLocaleString()} ({upPct}%)
                    </span>
                    <span style={{ color: "var(--score-poor)" }}>
                      👎 {votes.down.toLocaleString()} ({100 - upPct}%)
                    </span>
                  </div>
                </div>

                <div className={styles.voteActions}>
                  <p className={styles.votePrompt}>
                    {lang === "id"
                      ? "Apa penilaian Anda tentang transparansi brand ini?"
                      : "How do you rate this brand's transparency?"}
                  </p>
                  <div className={styles.voteButtons}>
                    <button
                      className={`${styles.voteBtn} ${voted === "up" ? styles.voteBtnActiveUp : ""}`}
                      onClick={() => handleVote("up")}
                    >
                      <ThumbsUp size={18} />
                      {lang === "id" ? "Transparan" : "Transparent"}
                    </button>
                    <button
                      className={`${styles.voteBtn} ${voted === "down" ? styles.voteBtnActiveDown : ""}`}
                      onClick={() => handleVote("down")}
                    >
                      <ThumbsDown size={18} />
                      {lang === "id" ? "Perlu Evaluasi" : "Needs Review"}
                    </button>
                  </div>
                </div>
              </div>

              <div className={`card card-body ${styles.panel} ${styles.suggestionPanel}`}>
                <h3>{lang === "id" ? "Punya informasi lebih?" : "Have more info?"}</h3>
                <p>
                  {lang === "id"
                    ? "Bantu komunitas dengan mengusulkan koreksi atau menambahkan sumber yang terverifikasi."
                    : "Help the community by suggesting corrections or adding verified sources."}
                </p>
                <button className="btn btn-outline btn-sm">
                  {lang === "id" ? "Usul Koreksi" : "Suggest a Correction"}
                </button>
              </div>
            </div>
          )}

          {/* ALTERNATIVES TAB */}
          {activeTab === "alternatives" && (
            <div className={styles.alternativesContent}>
              <p className={styles.altIntro}>
                {lang === "id"
                  ? `Berikut brand alternatif yang mungkin lebih sesuai dengan nilai Anda:`
                  : `Here are alternative brands that may better align with your values:`}
              </p>
              {alternatives.length > 0 ? (
                <div className={styles.altGrid}>
                  {alternatives.map((alt) => alt && (
                    <BrandCard key={alt.id} brand={alt} />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <p>{lang === "id" ? "Tidak ada alternatif tercatat" : "No alternatives recorded yet"}</p>
                </div>
              )}

              {/* Browse more */}
              <div className={styles.browseMore}>
                <Link
                  href={`/search?category=${brand.category}`}
                  className="btn btn-outline"
                >
                  {lang === "id" ? `Telusuri semua brand ${brand.category}` : `Browse all ${brand.category} brands`}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
