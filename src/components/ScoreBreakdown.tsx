"use client";

import { useApp } from "./AppProvider";
import { scoreToCssVar } from "@/lib/scoring";
import type { Brand, ScoreWeights } from "@/lib/types";
import styles from "./ScoreBreakdown.module.css";

const DIMENSIONS: { key: keyof ScoreWeights; en: string; id: string; desc: string; descId: string }[] = [
  {
    key: "halal",
    en: "Halal Compliance",
    id: "Kepatuhan Halal",
    desc: "Official certification, ingredients, supply chain halal status",
    descId: "Sertifikasi resmi, bahan-bahan, status halal rantai pasokan",
  },
  {
    key: "ethical",
    en: "Ethical Sourcing",
    id: "Sumber Etis",
    desc: "Fair labor, supply chain transparency, local vs global sourcing",
    descId: "Keadilan tenaga kerja, transparansi rantai pasokan, sumber lokal vs global",
  },
  {
    key: "esg",
    en: "ESG Performance",
    id: "Kinerja ESG",
    desc: "Environmental impact, social programs, governance quality",
    descId: "Dampak lingkungan, program sosial, kualitas tata kelola",
  },
  {
    key: "political",
    en: "Political Neutrality",
    id: "Netralitas Politik",
    desc: "No controversial political affiliations or conflict stances",
    descId: "Tidak ada afiliasi politik kontroversial atau sikap dalam konflik",
  },
  {
    key: "community",
    en: "Community Trust",
    id: "Kepercayaan Komunitas",
    desc: "User ratings, boycott history, controversy recency",
    descId: "Rating pengguna, riwayat boikot, kemutakhiran kontroversi",
  },
];

interface ScoreBreakdownProps {
  brand: Brand;
  weights: ScoreWeights;
}

export default function ScoreBreakdown({ brand, weights }: ScoreBreakdownProps) {
  const { lang } = useApp();

  return (
    <div className={styles.breakdown}>
      {DIMENSIONS.map((dim) => {
        const score = brand.scores[dim.key];
        const weight = weights[dim.key];
        const color = scoreToCssVar(score);

        return (
          <div key={dim.key} className={styles.row}>
            <div className={styles.header}>
              <div className={styles.titleRow}>
                <span className={styles.label}>{lang === "id" ? dim.id : dim.en}</span>
                <div className={styles.meta}>
                  <span className={styles.weight} data-tooltip={`Your weight: ${weight}%`}>
                    {weight}%
                  </span>
                  <span className={styles.score} style={{ color }}>
                    {score}
                  </span>
                </div>
              </div>
              <p className={styles.desc}>{lang === "id" ? dim.descId : dim.desc}</p>
            </div>
            <div className="score-bar-track">
              <div
                className="score-bar-fill"
                style={{
                  width: `${score}%`,
                  background: `linear-gradient(90deg, ${color}88, ${color})`,
                }}
              />
            </div>
          </div>
        );
      })}

      <p className={styles.note}>
        <span className="badge badge-editorial">{lang === "id" ? "Editorial" : "Editorial"}</span>
        {lang === "id"
          ? " Skor berdasarkan data publik yang dapat diverifikasi. Bukan keputusan hukum."
          : " Scores based on verifiable public data. Not a legal determination."}
      </p>
    </div>
  );
}

export { DIMENSIONS };
