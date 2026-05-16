"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle, Flag, Scale } from "lucide-react";
import { useApp } from "./AppProvider";
import { calculateAlignment } from "@/lib/scoring";
import { ScorePill } from "./ScoreBadge";
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

  return (
    <Link href={`/brand/${brand.id}`} className={`card ${styles.card} ${compact ? styles.compact : ""}`}>
      {/* Boycott band */}
      {brand.boycottActive && (
        <div className={styles.boycottBand}>
          <Flag size={12} />
          {lang === "id" ? "Diboikot" : "Boycotted"}
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
              <span className={styles.name}>{brand.name}</span>
              {brand.parentCompany && (
                <span className={styles.parent}>{brand.parentCompany}</span>
              )}
            </div>
          </div>

          {/* Score pill */}
          <div className={styles.scoreAndActions}>
            <button 
              className={`${styles.compareBtn} ${isComparing ? styles.compareActive : ""}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleCompare(brand.id);
              }}
              title={isComparing ? t("common", "removeFromCompare") : t("common", "addToCompare")}
            >
              <Scale size={14} />
            </button>
            <ScorePill result={result} />
          </div>
        </div>

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
              <CheckCircle size={11} />
              {t("brand", "certified")}
            </span>
          ) : (
            <span className="badge" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
              {t("brand", "notCertified")}
            </span>
          )}
          {brand.boycottActive && (
            <span className="badge badge-boycott">
              <AlertTriangle size={11} />
              {t("common", "boycott")}
            </span>
          )}
          <span className="badge badge-editorial">
            {brand.country}
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
            <span className={styles.communityPct}>{upPercent}% {lang === "id" ? "positif" : "positive"}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
