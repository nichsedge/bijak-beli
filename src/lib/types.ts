export interface Controversy {
  id: string;
  date: string;
  title: string;
  titleId: string;
  description: string;
  descriptionId: string;
  severity: "low" | "medium" | "high" | "critical";
  source: string;
  sourceUrl: string;
}

export interface Score {
  halal: number;       // 0-100: Halal compliance
  ethical: number;     // 0-100: Ethical sourcing & labor
  esg: number;         // 0-100: Environmental, Social, Governance
  political: number;   // 0-100: Political neutrality
  community: number;   // 0-100: Community trust rating
}

export interface ScoreWeights {
  halal: number;
  ethical: number;
  esg: number;
  political: number;
  community: number;
}

export interface Source {
  title: string;
  url: string;
  date: string;
}

export interface Brand {
  id: string;
  name: string;
  nameId?: string;
  logo: string;
  category: string;
  subcategory?: string;
  tagline: string;
  taglineId: string;
  country: string;
  parentCompany?: string;
  ultimateOwner?: string;
  ownerCountry?: string;
  foundedYear?: number;
  halalCertified: boolean;
  halalCertifier?: string;
  scores: Score;
  certifications: string[];
  controversyIds: string[];
  alternativeIds: string[];
  sources: Source[];
  communityVotes: { up: number; down: number };
  lastUpdated: string;
  description: string;
  descriptionId: string;
  boycottActive: boolean;
  boycottReason?: string;
  boycottReasonId?: string;
}

export interface Category {
  id: string;
  name: string;
  nameId: string;
  icon: string;
  brandCount: number;
}

export interface AlignmentResult {
  score: number;
  grade: "A+" | "A" | "B" | "C" | "D" | "F";
  dimensionScores: {
    halal: number;
    ethical: number;
    esg: number;
    political: number;
    community: number;
  };
}

export interface UserPreferences {
  weights: ScoreWeights;
  language: "id" | "en";
  darkMode: boolean;
  preset?: string;
  compareIds: string[];
  purchaseIds: string[];
}

export const DEFAULT_WEIGHTS: ScoreWeights = {
  halal: 25,
  ethical: 20,
  esg: 20,
  political: 15,
  community: 20,
};

export const PRESET_PROFILES: Record<string, { label: string; labelId: string; weights: ScoreWeights }> = {
  halal: {
    label: "Halal Lifestyle",
    labelId: "Gaya Hidup Halal",
    weights: { halal: 45, ethical: 20, esg: 10, political: 10, community: 15 },
  },
  eco: {
    label: "Eco-Conscious",
    labelId: "Ramah Lingkungan",
    weights: { halal: 10, ethical: 25, esg: 40, political: 10, community: 15 },
  },
  ethical: {
    label: "Ethical Consumer",
    labelId: "Konsumen Etis",
    weights: { halal: 15, ethical: 35, esg: 25, political: 10, community: 15 },
  },
  neutral: {
    label: "Political Neutral",
    labelId: "Netral Politik",
    weights: { halal: 15, ethical: 20, esg: 20, political: 35, community: 10 },
  },
  balanced: {
    label: "Balanced",
    labelId: "Seimbang",
    weights: { halal: 20, ethical: 20, esg: 20, political: 20, community: 20 },
  },
};
