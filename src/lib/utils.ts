export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function formatDate(dateStr: string, locale: string = "id-ID"): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function severityColor(severity: string): string {
  switch (severity) {
    case "critical": return "var(--score-poor)";
    case "high":     return "var(--score-concerning)";
    case "medium":   return "var(--score-fair)";
    case "low":      return "var(--score-good)";
    default:         return "var(--text-muted)";
  }
}

export function severityLabel(severity: string, lang: "id" | "en"): string {
  const map: Record<string, { en: string; id: string }> = {
    critical: { en: "Critical", id: "Kritis" },
    high:     { en: "High",     id: "Tinggi" },
    medium:   { en: "Medium",   id: "Sedang" },
    low:      { en: "Low",      id: "Rendah" },
  };
  return map[severity]?.[lang] ?? severity;
}
