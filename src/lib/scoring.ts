import type { AlignmentResult, Brand, ScoreWeights } from "./types";

export function calculateAlignment(brand: Brand, weights: ScoreWeights): AlignmentResult {
  const total = weights.halal + weights.ethical + weights.esg + weights.political + weights.community;

  const weighted =
    brand.scores.halal * weights.halal +
    brand.scores.ethical * weights.ethical +
    brand.scores.esg * weights.esg +
    brand.scores.political * weights.political +
    brand.scores.community * weights.community;

  const score = Math.round(weighted / total);

  return {
    score,
    grade: scoreToGrade(score),
    dimensionScores: { ...brand.scores },
  };
}

export function scoreToGrade(score: number): AlignmentResult["grade"] {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 40) return "D";
  return "F";
}

export function gradeColor(grade: AlignmentResult["grade"]): string {
  switch (grade) {
    case "A+": return "var(--score-excellent)";
    case "A":  return "var(--score-good-high)";
    case "B":  return "var(--score-good)";
    case "C":  return "var(--score-fair)";
    case "D":  return "var(--score-concerning)";
    case "F":  return "var(--score-poor)";
  }
}

export function gradeLabel(grade: AlignmentResult["grade"], lang: "id" | "en"): string {
  const labels: Record<AlignmentResult["grade"], { en: string; id: string }> = {
    "A+": { en: "Excellent", id: "Sangat Baik" },
    "A":  { en: "Very Good", id: "Baik Sekali" },
    "B":  { en: "Good",      id: "Baik" },
    "C":  { en: "Fair",      id: "Cukup" },
    "D":  { en: "Concerning", id: "Perlu Perhatian" },
    "F":  { en: "Poor",      id: "Buruk" },
  };
  return labels[grade][lang];
}

export function scoreToCssVar(score: number): string {
  if (score >= 80) return "var(--score-excellent)";
  if (score >= 65) return "var(--score-good-high)";
  if (score >= 50) return "var(--score-good)";
  if (score >= 35) return "var(--score-fair)";
  if (score >= 20) return "var(--score-concerning)";
  return "var(--score-poor)";
}

export function sortBrands(brands: Brand[], weights: ScoreWeights, direction: "asc" | "desc" = "desc") {
  return [...brands].sort((a, b) => {
    const scoreA = calculateAlignment(a, weights).score;
    const scoreB = calculateAlignment(b, weights).score;
    return direction === "desc" ? scoreB - scoreA : scoreA - scoreB;
  });
}

export interface ScoreAuditExplanation {
  dimension: string;
  score: number;
  rubric: string;
  rubricId: string;
  evidence: string;
  evidenceId: string;
}

export function getBrandScoreAudit(brand: Brand, lang: "id" | "en" = "id"): ScoreAuditExplanation[] {
  const halalAudit: ScoreAuditExplanation = {
    dimension: lang === "id" ? "Kepatuhan Halal" : "Halal Compliance",
    score: brand.scores.halal,
    rubric: brand.halalCertified
      ? (brand.halalCertId ? `Verified BPJPH registry (#${brand.halalCertId})` : "Certified by official halal certifier")
      : "Not certified / pending verification",
    rubricId: brand.halalCertified
      ? (brand.halalCertId ? `Sertifikat resmi BPJPH terdaftar (#${brand.halalCertId})` : "Tersertifikasi oleh lembaga halal berwenang")
      : "Belum tersertifikasi / menunggu pendaftaran",
    evidence: brand.halalCertId ? `BPJPH ID: ${brand.halalCertId}` : (brand.halalCertifier || "Self-Reported"),
    evidenceId: brand.halalCertId ? `Nomor BPJPH: ${brand.halalCertId}` : (brand.halalCertifier || "Deklarasi Mandiri"),
  };

  const politicalAudit: ScoreAuditExplanation = {
    dimension: lang === "id" ? "Netralitas Politik & Konglomerasi" : "Political Neutrality & UBO",
    score: brand.scores.political,
    rubric: brand.powerMapRank
      ? `Board seats linked to Power200 tycoon rank #${brand.powerMapRank}`
      : "Independent or dispersed shareholding without concentrated tycoon board seats",
    rubricId: brand.powerMapRank
      ? `Kursi direksi/komisaris terafiliasi konglomerat Power200 (Peringkat #${brand.powerMapRank})`
      : "Kepemilikan mandiri / tersebar tanpa dominasi konglomerasi oligarki",
    evidence: brand.idxTicker ? `IDX: ${brand.idxTicker}` : "KSEI / AHU Public Disclosures",
    evidenceId: brand.idxTicker ? `BEI: ${brand.idxTicker}` : "Keterbukaan KSEI / Kemenkumham",
  };

  const ethicalAudit: ScoreAuditExplanation = {
    dimension: lang === "id" ? "Etika Rantai Pasok & Buruh" : "Ethical Sourcing & Labor",
    score: brand.scores.ethical,
    rubric: brand.controversyIds.length > 0
      ? `${brand.controversyIds.length} active verified controversy deduction(s)`
      : "Zero active recorded labor disputes or violations",
    rubricId: brand.controversyIds.length > 0
      ? `Terdapat ${brand.controversyIds.length} sengketa etika/buruh terverifikasi`
      : "Nihil catatan sengketa ketenagakerjaan atau etika",
    evidence: brand.controversyIds.join(", ") || "Clean Audit",
    evidenceId: brand.controversyIds.join(", ") || "Audit Bersih",
  };

  const esgAudit: ScoreAuditExplanation = {
    dimension: lang === "id" ? "Kinerja Lingkungan & ESG" : "ESG Performance",
    score: brand.scores.esg,
    rubric: brand.scores.esg >= 80 ? "PROPER Hijau/Emas rating or SRI-KEHATI index constituent" : brand.scores.esg >= 60 ? "Compliant with industrial emissions standard (PROPER Biru)" : "Identified packaging waste or carbon reduction challenges",
    rubricId: brand.scores.esg >= 80 ? "Peringkat PROPER Emas/Hijau KLHK atau indeks SRI-KEHATI" : brand.scores.esg >= 60 ? "Memenuhi baku mutu standar lingkungan industri (PROPER Biru)" : "Catatan pembuangan limbah plastik / jejak karbon manufaktur",
    evidence: "KLHK PROPER & Corporate Sustainability Report",
    evidenceId: "Laporan PROPER KLHK & Keterbukaan Keberlanjutan",
  };

  return [halalAudit, politicalAudit, ethicalAudit, esgAudit];
}
