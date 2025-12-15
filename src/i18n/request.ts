import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

// 정적 import로 모든 locale 파일 로드
import koCommon from '@/locales/ko/common.json';
import koHome from '@/locales/ko/home.json';
import koWhykbeauty from '@/locales/ko/whykbeauty.json';
import koRecommendTreatment from '@/locales/ko/recommend_treatment.json';

import enCommon from '@/locales/en/common.json';
import enHome from '@/locales/en/home.json';
import enWhykbeauty from '@/locales/en/whykbeauty.json';
import enRecommendTreatment from '@/locales/en/recommend_treatment.json';

import jaCommon from '@/locales/ja/common.json';
import jaHome from '@/locales/ja/home.json';
import jaWhykbeauty from '@/locales/ja/whykbeauty.json';

import zhCNCommon from '@/locales/zh-CN/common.json';
import zhCNHome from '@/locales/zh-CN/home.json';
import zhCNWhykbeauty from '@/locales/zh-CN/whykbeauty.json';

import zhTWCommon from '@/locales/zh-TW/common.json';
import zhTWHome from '@/locales/zh-TW/home.json';
import zhTWWhykbeauty from '@/locales/zh-TW/whykbeauty.json';

const messages: Record<string, Record<string, unknown>> = {
  ko: { ...koCommon, ...koHome, ...koWhykbeauty, ...koRecommendTreatment },
  en: { ...enCommon, ...enHome, ...enWhykbeauty, ...enRecommendTreatment },
  ja: { ...jaCommon, ...jaHome, ...jaWhykbeauty, ...enRecommendTreatment }, // recommend_treatment은 en fallback
  'zh-CN': { ...zhCNCommon, ...zhCNHome, ...zhCNWhykbeauty, ...enRecommendTreatment }, // recommend_treatment은 en fallback
  'zh-TW': { ...zhTWCommon, ...zhTWHome, ...zhTWWhykbeauty, ...enRecommendTreatment }, // recommend_treatment은 en fallback
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
