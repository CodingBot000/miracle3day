// Import from locale files instead of standalone JSON
import koLocale from '@/locales/ko/treatment_aged_guide.json';
import enLocale from '@/locales/en/treatment_aged_guide.json';
import jaLocale from '@/locales/ja/treatment_aged_guide.json';
import zhCNLocale from '@/locales/zh-CN/treatment_aged_guide.json';
import zhTWLocale from '@/locales/zh-TW/treatment_aged_guide.json';

export interface Concern {
  name: string;
  desc: string;
}

export interface Treatment {
  id: string;
  name: string;
  effect: string;
  cycle?: string;
  duration?: string;
  costFrom?: number;
  costTo?: number;
  priceUnit?: string;
  interval?: string;
  time?: string;
  onset?: string;
  downtime?: string;
  imageUrl?: string;
}

export interface SkinTypes {
  dry?: string;
  oily?: string;
  sensitive?: string;
  combination?: string;
}

export interface SpecialTipsSubsection {
  title: string;
  tips: string[];
}

export interface SpecialTips {
  subsections: SpecialTipsSubsection[];
}

export interface AgeBasedItem {
  id: string;
  age_group: string;
  lang: string;
  heroImage?: string;
  title: string;
  subtitle: string;
  intro: string;
  concerns_title: string;
  concerns: Concern[];
  treatments_title: string;
  treatments: Treatment[];
  skin_types_title: string;
  skin_types: SkinTypes;
  special_tips_title: string;
  special_tips: SpecialTips;
}

// Transformation helper: converts new locale structure to old interface
function transformAgeGroupData(
  ageGroup: string,
  lang: 'ko' | 'en' | 'ja' | 'zh-CN' | 'zh-TW',
  data: any
): AgeBasedItem {
  return {
    id: `uuid-${ageGroup}-${lang}`,
    age_group: ageGroup,
    lang: lang,
    heroImage: data.heroImage,
    title: data.title,
    subtitle: data.subtitle,
    intro: data.intro,
    concerns_title: data.concerns.title,
    concerns: data.concerns.items,
    treatments_title: data.treatments.title,
    treatments: data.treatments.items,
    skin_types_title: data.skinTypes.title,
    skin_types: data.skinTypes.items,
    special_tips_title: data.specialTips.title,
    special_tips: data.specialTips,
  };
}

// Build ageBasedData from locale files (compatibility layer)
const ageGroups = ['20s', '30s', '40s', '50s', '60s', '70s+'];

export const ageBasedData = {
  ko: ageGroups.map(age =>
    transformAgeGroupData(age, 'ko', (koLocale.TreatmentAgedGuide as any).ageGroups[age])
  ),
  en: ageGroups.map(age =>
    transformAgeGroupData(age, 'en', (enLocale.TreatmentAgedGuide as any).ageGroups[age])
  ),
  ja: ageGroups.map(age =>
    transformAgeGroupData(age, 'ja', (jaLocale.TreatmentAgedGuide as any).ageGroups[age])
  ),
    'zh-CN': ageGroups.map(age =>
    transformAgeGroupData(age, 'zh-CN', (zhCNLocale.TreatmentAgedGuide as any).ageGroups[age])
  ),
    'zh-TW': ageGroups.map(age =>
    transformAgeGroupData(age, 'zh-TW', (zhTWLocale.TreatmentAgedGuide as any).ageGroups[age])
  ),
};