import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// 정적 import로 모든 locale 파일 로드
import koCommon from '@/locales/ko/common.json';
import koHome from '@/locales/ko/home.json';
import koWhykbeauty from '@/locales/ko/whykbeauty.json';
import koRecommendTreatment from '@/locales/ko/recommend_treatment.json';
import koTreatmentAgedGuide from '@/locales/ko/treatment_aged_guide.json';
import koAuth from '@/locales/ko/auth.json';

import enCommon from '@/locales/en/common.json';
import enHome from '@/locales/en/home.json';
import enWhykbeauty from '@/locales/en/whykbeauty.json';
import enRecommendTreatment from '@/locales/en/recommend_treatment.json';
import enTreatmentAgedGuide from '@/locales/en/treatment_aged_guide.json';
import enAuth from '@/locales/en/auth.json';

import jaCommon from '@/locales/ja/common.json';
import jaHome from '@/locales/ja/home.json';
import jaWhykbeauty from '@/locales/ja/whykbeauty.json';
import jaTreatmentAgedGuide from '@/locales/ja/treatment_aged_guide.json';
import jaAuth from '@/locales/ja/auth.json';

import zhCNCommon from '@/locales/zh-CN/common.json';
import zhCNHome from '@/locales/zh-CN/home.json';
import zhCNWhykbeauty from '@/locales/zh-CN/whykbeauty.json';
import zhCNTreatmentAgedGuide from '@/locales/zh-CN/treatment_aged_guide.json';
import zhCNAuth from '@/locales/zh-CN/auth.json';

import zhTWCommon from '@/locales/zh-TW/common.json';
import zhTWHome from '@/locales/zh-TW/home.json';
import zhTWWhykbeauty from '@/locales/zh-TW/whykbeauty.json';
import zhTWTreatmentAgedGuide from '@/locales/zh-TW/treatment_aged_guide.json';
import zhTWAuth from '@/locales/zh-TW/auth.json';

const messages: Record<string, Record<string, unknown>> = {
  ko: { ...koCommon, ...koHome, ...koWhykbeauty, ...koRecommendTreatment, ...koTreatmentAgedGuide, ...koAuth },
  en: { ...enCommon, ...enHome, ...enWhykbeauty, ...enRecommendTreatment, ...enTreatmentAgedGuide, ...enAuth },
  ja: { ...jaCommon, ...jaHome, ...jaWhykbeauty, ...enRecommendTreatment, ...jaTreatmentAgedGuide, ...jaAuth },
  'zh-CN': { ...zhCNCommon, ...zhCNHome, ...zhCNWhykbeauty, ...enRecommendTreatment, ...zhCNTreatmentAgedGuide, ...zhCNAuth },
  'zh-TW': { ...zhTWCommon, ...zhTWHome, ...zhTWWhykbeauty, ...enRecommendTreatment, ...zhTWTreatmentAgedGuide, ...zhTWAuth },
};

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // 유효하지 않은 locale이면 기본값 사용
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: messages[locale] || messages.en,
  };
});
