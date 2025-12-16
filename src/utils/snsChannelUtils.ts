import { SNSChannelData } from '@/models/hospitalData.dto';

export interface ParsedSNSChannel {
  locale: string;        // 'default', 'en', 'ja', 'zh-TW', 'zh-CN', 'ko'
  url: string;
  displayName: string;   // 표시용 언어 이름
  flagEmoji: string;     // 국가 플래그 이모지 ('🇺🇸', '🇯🇵', etc.) 또는 ''
}

/**
 * SNS 채널 JSONB 데이터를 파싱하여 표시 가능한 계정 목록으로 변환
 *
 * 로직:
 * 1. null이면 빈 배열 반환
 * 2. default만 있으면 1개 반환 (flagEmoji 없음)
 * 3. 다른 언어 중 하나라도 default와 같은 값이 있으면 default 숨김
 * 4. 순서: default (필터링 후), en, ja, zh-TW, zh-CN, ko
 */
export function parseSNSChannelData(
  channelData: SNSChannelData,
  currentDisplayLocale: string = 'ko'
): ParsedSNSChannel[] {
  // 1. null 체크
  if (!channelData) return [];

  const defaultUrl = channelData.default;
  if (!defaultUrl) return [];

  // 2. default만 있는 경우
  const otherLocales = Object.keys(channelData).filter(k => k !== 'default') as Array<'en' | 'ja' | 'zh-TW' | 'zh-CN' | 'ko'>;
  if (otherLocales.length === 0) {
    return [{
      locale: 'default',
      url: defaultUrl,
      displayName: '',
      flagEmoji: '',
    }];
  }

  // 3. 다른 언어 중 하나라도 default와 같은 값이 있는지 확인
  const hasMatchingLocale = otherLocales.some(locale => channelData[locale] === defaultUrl);

  // 4. 결과 배열 구성 (순서: default, en, ja, zh-TW, zh-CN, ko)
  const result: ParsedSNSChannel[] = [];

  // default 추가 (다른 언어와 겹치지 않는 경우만)
  if (!hasMatchingLocale) {
    result.push({
      locale: 'default',
      url: defaultUrl,
      displayName: '',
      flagEmoji: '',
    });
  }

  // 정해진 순서대로 언어 추가
  const orderedLocales: Array<'en' | 'ja' | 'zh-TW' | 'zh-CN' | 'ko'> = ['en', 'ja', 'zh-TW', 'zh-CN', 'ko'];

  orderedLocales.forEach(locale => {
    const url = channelData[locale];
    if (url) {
      result.push({
        locale,
        url,
        displayName: getLocaleName(locale, currentDisplayLocale),
        flagEmoji: getCountryFlagEmoji(locale),
      });
    }
  });

  return result;
}

/**
 * 언어 코드를 국가 플래그 이모지로 변환
 */
export function getCountryFlagEmoji(locale: string): string {
  const flags: Record<string, string> = {
    'en': '🇺🇸',
    'ja': '🇯🇵',
    'zh-TW': '🇹🇼',
    'zh-CN': '🇨🇳',
    'ko': '🇰🇷',
  };
  return flags[locale] || '';
}

/**
 * locale을 displayLocale 언어로 표시
 * 예: ('ja', 'ko') => "일본어"
 * 예: ('ja', 'en') => "Japanese"
 */
export function getLocaleName(locale: string, displayLocale: string): string {
  const names: Record<string, Record<string, string>> = {
    'en': {
      ko: '영어',
      en: 'English',
      ja: '英語',
      'zh-TW': '英文',
      'zh-CN': '英文'
    },
    'ja': {
      ko: '일본어',
      en: 'Japanese',
      ja: '日本語',
      'zh-TW': '日文',
      'zh-CN': '日文'
    },
    'zh-TW': {
      ko: '중국어(번체)',
      en: 'Traditional Chinese',
      ja: '繁体字中国語',
      'zh-TW': '繁體中文',
      'zh-CN': '繁体中文'
    },
    'zh-CN': {
      ko: '중국어(간체)',
      en: 'Simplified Chinese',
      ja: '簡体字中国語',
      'zh-TW': '簡體中文',
      'zh-CN': '简体中文'
    },
    'ko': {
      ko: '한국어',
      en: 'Korean',
      ja: '韓国語',
      'zh-TW': '韓文',
      'zh-CN': '韩文'
    },
  };
  return names[locale]?.[displayLocale] || locale;
}
