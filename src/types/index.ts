// ==========================================
// Aegis Global News AI Dashboard — Type Definitions
// ==========================================

/** Raw article from GNews API */
export interface GNewsArticle {
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
}

/** GNews API response */
export interface GNewsResponse {
  totalArticles: number;
  articles: GNewsArticle[];
}

/** AI-analyzed article with enrichments */
export interface AnalyzedArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: {
    name: string;
    url: string;
  };
  // AI enrichments
  summary: string;
  genre: string;
  reliability_score: number;
  sentiment: number; // -1 to 1
  veracity?: 'VERIFIED' | 'UNVERIFIED' | 'SENSATIONALIST';
}

/** Geopolitical ripple effect */
export interface RippleEffect {
  sourceCountry: string;
  affectedCountries: {
    code: string;
    name: string;
    lat: number;
    lng: number;
    impact: string;
  }[];
}

/** Counter-perspective data */
export interface CounterPerspective {
  region: string;
  perspective: string;
  summary: string;
  source?: string;
}

/** Country data for the globe */
export interface CountryInfo {
  name: string;
  code: string;
  lat: number;
  lng: number;
  neighbors: string[];
}

/** Globe point for heatmap / rings */
export interface GlobePoint {
  lat: number;
  lng: number;
  intensity: number;
  label?: string;
  country?: string;
}

/** Arc data for ripple effects on globe */
export interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  label?: string;
}

/** App state for selected country */
export interface CountrySelection {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

/** Sentiment atmosphere data */
export interface SentimentAtmosphere {
  averageSentiment: number;
  color: [number, number, number]; // RGB
}
