"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle, Flag, Scale, Crown } from "lucide-react";
import { useApp } from "./AppProvider";
import { calculateAlignment } from "@/lib/scoring";
import { ScorePill } from "./ScoreBadge";
import { conglomerates } from "@/data/conglomerates";
import type { Brand } from "@/lib/types";
import styles from "./BrandCard.module.css";

interface BrandCardProps {
  brand: Brand;
  compact?: boolean;
}

export default function BrandCard({ brand, compact = false }: BrandCardProps) {
  const { prefs, lang, toggleCompare, t } = useApp();
  const isComparing = prefs.compareIds?.includes(brand.id);
  const result = calculateAlignment(brand, prefs.weights);
  const upPercent = Math.round((brand.communityVotes.up / (brand.communityVotes.up + brand.communityVotes.down + 1)) * 100);

  const conglomerate = brand.conglomerateId
    ? conglomerates.find((c) => c.id === brand.conglomerateId)
    : null;

  return (
    <Link href={`/brand/${brand.id}`} className={`card ${styles.card} ${compact ? styles.compact : ""}`}>
      {/* Boycott band */}
      {brand.boycottActive && (
        <div className={styles.boycottBand}>
          <Flag size={12} />
          <span>{lang === "id" ? "Diboikot" : "Boycotted"}</span>
          {brand.boycottReason && (
            <span className={styles.boycottReasonShort}>
              • {brand.boycottReason.split(".")[0]}
            </span>
          )}
        </div>
      )}

      <div className="card-body">
        <div className={styles.top}>
          {/* Brand identity */}
          <div className={styles.identity}>
            <div className={styles.logoWrap}>
              <span className={styles.logoFallback}>{brand.name[0]}</span>
            </div>
            <div className={styles.meta}>
              <span className={styles.name} title={brand.name}>{brand.name}</span>
              {brand.parentCompany && (
                <span className={styles.parent} title={brand.parentCompany}>
                  {brand.parentCompany}
                </span>
              )}
            </div>
          </div>

          {/* Score pill & Quick compare */}
          <div className={styles.scoreAndActions}>
            <button 
              type="button"
              className={`${styles.compareBtn} ${isComparing ? styles.compareActive : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCompare(brand.id);
              }}
              aria-label={isComparing ? t("common", "removeFromCompare") : t("common", "addToCompare")}
              title={isComparing ? t("common", "removeFromCompare") : t("common", "addToCompare")}
            >
              <Scale size={13} />
            </button>
            <ScorePill result={result} />
          </div>
        </div>

        {/* Conglomerate / Ticker banner if mapped */}
        {conglomerate && (
          <div className={styles.conglomerateBadge}>
            <Crown size={11} color="var(--primary-dark)" />
            <span className={styles.conglomerateName}>
              Grup: <strong>{conglomerate.name}</strong>
            </span>
            {brand.idxTicker && (
              <span className={styles.tickerPill}>BEI:{brand.idxTicker}</span>
            )}
          </div>
        )}

        {/* Tagline */}
        {!compact && (
          <p className={styles.tagline}>
            {lang === "id" ? brand.taglineId : brand.tagline}
          </p>
        )}

        {/* Badges row */}
        <div className={styles.badges}>
          {brand.halalCertified ? (
            <span className="badge badge-halal">
              <CheckCircle size={10} />
              {t("brand", "certified")}
            </span>
          ) : (
            <span className="badge" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
              {t("brand", "notCertified")}
            </span>
          )}
          {brand.boycottActive && (
            <span className="badge badge-boycott">
              <AlertTriangle size={10} />
              {t("common", "boycott")}
            </span>
          )}
          <span className="badge badge-editorial">
            {brand.category}
          </span>
        </div>

        {/* Community bar */}
        {!compact && (
          <div className={styles.community}>
            <div className={styles.communityBar}>
              <div
                className={styles.communityFill}
                style={{ width: `${upPercent}%` }}
              />
            </div>
            <span className={styles.communityPct}>
              {upPercent}% {lang === "id" ? "positif" : "positive"}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

