export interface KBeautySectionMeta {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  tagline: string;
}

export interface KBeautyIntro {
  paragraph1: string;
  paragraph2: string;
  paragraph3: string;
  paragraph4?: string;
  paragraph5?: string;
}

export interface KBeautyMainPoint {
  title: string;
  subtitle?: string;
  content: string[];
  image: string;
  stats?: Record<string, string | { value: string; label: string }>;
  tenSteps?: string[];
}

export interface KBeautyStatistics {
  title: string;
  data: Record<string, {
    value: string;
    label: string;
  }>;
  image?: string;
}

export interface KBeautyConclusion {
  title: string;
  quote: string;
  points: string[];
  closingLine: string;
  image: string;
}

export interface KBeautyCTA {
  text: string;
  link: string;
}

export interface KBeautySection {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  tagline: string;
  intro?: KBeautyIntro;
  mainPoints?: Record<string, KBeautyMainPoint>;
  statistics?: KBeautyStatistics;
  conclusion?: KBeautyConclusion;
  cta?: KBeautyCTA;
}
