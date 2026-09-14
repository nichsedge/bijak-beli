"use client";

import { useState, useEffect } from "react";
import { Zap, Loader2 } from "lucide-react";
import type { Brand, AlignmentResult } from "@/lib/types";
import styles from "./AiInsight.module.css";

interface AiInsightProps {
  brand: Brand;
  result: AlignmentResult;
  lang: string;
}

export default function AiInsight({ brand, result, lang }: AiInsightProps) {
  const [insight, setInsight] = useState("");
  const [isThinking, setIsThinking] = useState(true);
  const [displayedText, setDisplayedText] = useState("");

  const currentKey = `${brand.id}-${result.score}-${lang}`;
  const [prevKey, setPrevKey] = useState(currentKey);
  if (prevKey !== currentKey) {
    setPrevKey(currentKey);
    setIsThinking(true);
    setDisplayedText("");
  }

  useEffect(() => {
    // Simulate AI thinking
    const timer = setTimeout(() => {
      const generated = generateMockInsight(brand, result, lang);
      setInsight(generated);
      setIsThinking(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, [brand, result, lang]);

  useEffect(() => {
    if (!isThinking && insight) {
      let i = 0;
      const interval = setInterval(() => {
        setDisplayedText(insight.slice(0, i));
        i++;
        if (i > insight.length) clearInterval(interval);
      }, 15);
      return () => clearInterval(interval);
    }
  }, [isThinking, insight]);

  return (
    <div className={`card card-body ${styles.aiPanel}`}>
      <div className={styles.aiHeader}>
        <div className={styles.aiIcon}>
          <Zap size={18} />
        </div>
        <h2 className={styles.aiTitle}>Bijak Insights (AI)</h2>
      </div>
      
      {isThinking ? (
        <div className={styles.thinking}>
          <Loader2 size={20} className="animate-spin" />
          <span>{lang === "id" ? "Menganalisis keselarasan nilai..." : "Analyzing value alignment..."}</span>
        </div>
      ) : (
        <p className={styles.aiText}>
          {displayedText}
          <span className={styles.cursor}>|</span>
        </p>
      )}
      
      <div className={styles.aiFooter}>
        {lang === "id" 
          ? "Analisis berbasis bobot nilai personal Anda." 
          : "Analysis based on your personal value weights."}
      </div>
    </div>
  );
}

function generateMockInsight(brand: Brand, result: AlignmentResult, lang: string) {
  const isGood = result.score >= 70;
  const dimension = Object.entries(brand.scores).sort((a, b) => b[1] - a[1])[0][0];
  
  if (lang === "id") {
    if (brand.boycottActive) return `${brand.name} saat ini sedang dalam daftar boikot aktif. Dukungan Anda terhadap brand ini mungkin tidak sejalan dengan komitmen etis Anda. Kami merekomendasikan untuk meninjau tab 'Alternatif' untuk pilihan yang lebih baik.`;
    if (isGood) return `${brand.name} sangat cocok dengan profil nilai Anda dengan skor ${result.score}%. Kepatuhan mereka terhadap ${dimension} sangat menonjol dibanding brand lain di kategori ini. Ini adalah pilihan yang bijak sesuai preferensi Anda.`;
    return `${brand.name} memiliki keselarasan moderat (${result.score}%). Meskipun mereka unggul dalam ${dimension}, ada beberapa aspek yang mungkin perlu Anda tinjau kembali sebelum membeli, terutama terkait kebijakan politik dan transparansi ESG mereka.`;
  } else {
    if (brand.boycottActive) return `${brand.name} is currently under an active boycott. Supporting this brand may not align with your ethical commitments. We recommend checking the 'Alternatives' tab for better options.`;
    if (isGood) return `${brand.name} is a great match for your values with a ${result.score}% alignment. Their commitment to ${dimension} is particularly impressive compared to competitors. This is a wise choice based on your preferences.`;
    return `${brand.name} has moderate alignment (${result.score}%). While they perform well in ${dimension}, there are other aspects you might want to review before purchasing, particularly regarding their political policies and ESG transparency.`;
  }
}
