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
