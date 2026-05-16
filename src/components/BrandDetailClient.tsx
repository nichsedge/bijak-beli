"use client";

import { useState } from "react";
import { 
  CheckCircle, ThumbsUp, ThumbsDown, ShoppingBag, 
  ChevronRight, Building2, Shield, AlertTriangle, Hash,
  ExternalLink, ChevronUp, ChevronDown, Calendar
} from "lucide-react";
import { useApp } from "@/components/AppProvider";
import ScoreBadge from "@/components/ScoreBadge";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import BrandCard from "@/components/BrandCard";
import AiInsight from "@/components/AiInsight";
import { formatDate, severityColor, severityLabel } from "@/lib/utils";
import type { Controversy, Brand } from "@/lib/types";
import styles from "../app/brand/[id]/brand.module.css";

interface BrandDetailClientProps {
  brand: Brand;
  brandControversies: Controversy[];
  alternatives: Brand[];
  result: any;
}

export default function BrandDetailClient({ brand, brandControversies, alternatives, result }: BrandDetailClientProps) {
  const { prefs, lang, toggleCompare, recordPurchase, t } = useApp();
  const isComparing = prefs.compareIds?.includes(brand.id);
  const [activeTab, setActiveTab] = useState("overview");
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  const [purchased, setPurchased] = useState(false);
  const [votes, setVotes] = useState(brand.communityVotes);

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
    { id: "overview", label: t("brand", "overview") },
    { id: "transparency", label: t("brand", "transparency") },
    { id: "community", label: t("brand", "community") },
    { id: "alternatives", label: t("brand", "alternatives") },
  ];

  return (
    <>
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
                  {brand.halalCertifier || "Halal"}
                </span>
              ) : (
                <span className="badge" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
                  {t("brand", "notCertified")}
                </span>
              )}
              {brand.boycottActive && (
                <span className="badge badge-boycott">
                  {t("common", "boycott")}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className={styles.scoreSide}>
          <ScoreBadge result={result} size="lg" animate />
          <p className={styles.scoreLabel}>{t("scores", "overall")}</p>
          <button 
            className={`btn ${purchased ? 'btn-primary' : 'btn-outline'} btn-sm`}
            style={{ marginTop: 'var(--space-3)', width: '100%' }}
            onClick={() => {
              recordPurchase(brand.id);
              setPurchased(true);
              setTimeout(() => setPurchased(false), 2000);
            }}
          >
            {purchased ? <CheckCircle size={14} /> : <ShoppingBag size={14} />}
            {purchased ? t("values", "saved") : (lang === "id" ? "Saya Beli Ini" : "I Bought This")}
          </button>
        </div>
      </div>

      <p className={styles.description}>
        {lang === "id" ? brand.descriptionId : brand.description}
      </p>

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

      <div className={styles.tabContent}>
        {activeTab === "overview" && (
          <div className={styles.overviewGrid}>
            <div className={`card card-body ${styles.panel}`}>
              <h2 className="section-title" style={{ fontSize: "var(--text-base)", marginBottom: "var(--space-4)" }}>
                {t("scores", "breakdown")}
              </h2>
              <ScoreBreakdown brand={brand} weights={prefs.weights} />
            </div>

            <AiInsight brand={brand} result={result} lang={lang} />

            <div className={styles.sidePanel}>
              <div className={`card card-body ${styles.panel}`}>
                <h2 className={styles.panelTitle}><Building2 size={16} />{t("brand", "parentCompany")}</h2>
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
                </div>
              </div>

              {brandControversies.length > 0 && (
                <div className={`card card-body ${styles.panel}`}>
                  <h2 className={styles.panelTitle}><AlertTriangle size={16} />{t("brand", "controversies")}</h2>
                  <div className={styles.controversyList}>
                    {brandControversies.map((c) => (
                      <div key={c.id} className={styles.controversyItem}>
                        <div className={styles.severityDot} style={{ background: severityColor(c.severity) }} />
                        <div>
                          <div className={styles.controversyTitle}>{lang === "id" ? c.titleId : c.title}</div>
                          <div className={styles.controversyDate}>
                            {formatDate(c.date, lang === "id" ? "id-ID" : "en-US")}
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

        {activeTab === "transparency" && (
          <div className={styles.transparencyContent}>
            <div className={`card card-body ${styles.panel}`}>
              <h2 className={styles.panelTitle}><Hash size={16} />{t("brand", "transparency")}</h2>
              {brandControversies.length === 0 ? (
                <div className={styles.emptyState}><CheckCircle size={32} color="var(--score-excellent)" /><p>{t("brand", "noControversies")}</p></div>
              ) : (
                <div className={styles.timeline}>
                  {brandControversies.map((c) => (
                    <div key={c.id} className={styles.timelineItem}>
                      <div className={styles.timelineDate}>{formatDate(c.date, lang === "id" ? "id-ID" : "en-US")}</div>
                      <div className={styles.timelineDot} style={{ background: severityColor(c.severity) }} />
                      <div className={styles.timelineContent}>
                        <h3 className={styles.timelineTitle}>{lang === "id" ? c.titleId : c.title}</h3>
                        <p className={styles.timelineDesc}>{lang === "id" ? c.descriptionId : c.description}</p>
                        <a href={c.sourceUrl} target="_blank" rel="noopener" className={styles.sourceLink}><ExternalLink size={12} />{c.source}</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "community" && (
          <div className={styles.communityContent}>
            <div className={`card card-body ${styles.panel}`}>
              <h2 className={styles.panelTitle}>{t("community", "sentiment")}</h2>
              <div className={styles.voteDisplay}>
                <div className={styles.voteBar}><div className={styles.voteBarUp} style={{ width: `${upPct}%` }} /><div className={styles.voteBarDown} style={{ width: `${100 - upPct}%` }} /></div>
                <div className={styles.voteNumbers}>
                  <span style={{ color: "var(--score-excellent)" }}>👍 {votes.up.toLocaleString()} ({upPct}%)</span>
                  <span style={{ color: "var(--score-poor)" }}>👎 {votes.down.toLocaleString()} ({100 - upPct}%)</span>
                </div>
              </div>
              <div className={styles.voteActions}>
                <p className={styles.votePrompt}>{t("community", "vote")}</p>
                <div className={styles.voteButtons}>
                  <button className={`${styles.voteBtn} ${voted === "up" ? styles.voteBtnActiveUp : ""}`} onClick={() => handleVote("up")}><ThumbsUp size={18} />{t("community", "upvote")}</button>
                  <button className={`${styles.voteBtn} ${voted === "down" ? styles.voteBtnActiveDown : ""}`} onClick={() => handleVote("down")}><ThumbsDown size={18} />{t("community", "downvote")}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "alternatives" && (
          <div className={styles.alternativesContent}>
            <p className={styles.altIntro}>{t("common", "alternatives")}</p>
            <div className={styles.altGrid}>
              {alternatives.map((alt) => alt && <BrandCard key={alt.id} brand={alt} />)}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
