"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle, Flag } from "lucide-react";
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
  const { prefs, lang } = useApp();
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
          <ScorePill result={result} />
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
              {lang === "id" ? "Halal" : "Halal"}
            </span>
          ) : (
            <span className="badge" style={{ background: "var(--surface-2)", color: "var(--text-muted)" }}>
              {lang === "id" ? "Tidak Bersertifikat" : "No Halal Cert"}
            </span>
          )}
          {brand.boycottActive && (
            <span className="badge badge-boycott">
              <AlertTriangle size={11} />
              {lang === "id" ? "Boikot" : "Boycott"}
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
