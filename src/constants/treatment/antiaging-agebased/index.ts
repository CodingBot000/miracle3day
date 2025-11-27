import ageBasedDataKo from './agebased-antiaging_ko.json';
import ageBasedDataEn from './agebased-antiaging_en.json';

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

export const ageBasedData = {
  ko: ageBasedDataKo as AgeBasedItem[],
  en: ageBasedDataEn as AgeBasedItem[]
};