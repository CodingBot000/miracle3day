/**
 * i18n Content Locale Utilities
 *
 * 모든 상황에서 에러 없이 동작하며,
 * 해당 locale에 파일이 없으면 자동으로 en fallback
 */

import ko from '@/locales/ko/whykbeauty.json';
import en from '@/locales/en/whykbeauty.json';

const CONTENT_LOCALES = ['ko', 'en'];
const FALLBACK_LOCALE = 'en';

// ============================================
// WhyKBeauty Content
// ============================================

export type ContentData = typeof ko;

const kBeautyContent: Record<string, ContentData> = { ko, en };

/**
 * WhyKBeauty 콘텐츠 가져오기
 * - ko/en만 지원, 나머지는 en fallback
 */
export function getKBeautyContent(locale: string): ContentData {
  const contentLocale = getContentLocale(locale);
  return kBeautyContent[contentLocale] || kBeautyContent.en;
}

/**
 * 콘텐츠가 존재하는 locale인지 확인하고, 없으면 fallback 반환
 */
export function getContentLocale(locale: string): string {
  return CONTENT_LOCALES.includes(locale) ? locale : FALLBACK_LOCALE;
}

/**
 * 특정 namespace의 JSON 가져오기
 * - 해당 locale에 파일이 없으면 자동으로 en fallback
 * - 절대 에러 발생하지 않음
 * 
 * @example
 * const common = await getMessages('ja', 'common');
 * const home = await getMessages('zh-CN', 'home'); // en/home.json 반환
 */
export async function getMessages<T = Record<string, unknown>>(
  locale: string,
  namespace: string
): Promise<T> {
  const contentLocale = getContentLocale(locale);
  
  try {
    // 1차: 요청된 locale (또는 contentLocale)에서 시도
    return (await import(`@/locales/${contentLocale}/${namespace}.json`)).default;
  } catch {
    try {
      // 2차: fallback locale에서 시도
      return (await import(`@/locales/${FALLBACK_LOCALE}/${namespace}.json`)).default;
    } catch {
      // 3차: 빈 객체 반환 (절대 에러 발생 안함)
      console.warn(`[i18n] Missing: locales/${FALLBACK_LOCALE}/${namespace}.json`);
      return {} as T;
    }
  }
}

/**
 * 여러 namespace 한번에 가져오기
 * 
 * @example
 * const { common, home } = await getMultipleMessages('ja', ['common', 'home']);
 */
export async function getMultipleMessages<T extends string>(
  locale: string,
  namespaces: T[]
): Promise<Record<T, Record<string, unknown>>> {
  const result = {} as Record<T, Record<string, unknown>>;
  
  await Promise.all(
    namespaces.map(async (ns) => {
      result[ns] = await getMessages(locale, ns);
    })
  );
  
  return result;
}

/**
 * 모든 기본 messages 가져오기 (common + home)
 * Layout에서 사용하기 좋음
 */
export async function getDefaultMessages(locale: string) {
  return getMultipleMessages(locale, ['common', 'home']);
}

/**
 * 콘텐츠 페이지용 (common + home + contents)
 */
export async function getContentPageMessages(locale: string) {
  return getMultipleMessages(locale, ['common', 'home', 'contents']);
}

// ============================================
// DB 콘텐츠용 유틸리티 (추후 사용)
// ============================================

/**
 * 패턴 1: name_ko, name_en 별도 컬럼
 * 사용: getLocalizedColumn('name', 'ja') → 'name_en'
 */
export function getLocalizedColumn(column: string, locale: string): string {
  const contentLocale = getContentLocale(locale);
  return `${column}_${contentLocale}`;
}

/**
 * 패턴 2: JSONB { "ko": "...", "en": "..." }
 * 사용: getLocalizedValue({ ko: '안녕', en: 'Hello' }, 'ja') → 'Hello'
 */
export function getLocalizedValue<T = string>(
  jsonb: Record<string, T> | null | undefined,
  locale: string
): T | undefined {
  if (!jsonb) return undefined;
  const contentLocale = getContentLocale(locale);
  return jsonb[contentLocale] ?? jsonb[FALLBACK_LOCALE];
}

/**
 * 패턴 3: JSONB 객체 전체를 로컬라이즈
 * { title: { ko: '...', en: '...' }, content: { ko: '...', en: '...' } }
 * → { title: '...', content: '...' }
 */
export function getLocalizedObject<T = string>(
  jsonb: Record<string, Record<string, T>> | null | undefined,
  locale: string
): Record<string, T> {
  if (!jsonb) return {};
  const contentLocale = getContentLocale(locale);
  
  const result: Record<string, T> = {};
  for (const [key, value] of Object.entries(jsonb)) {
    if (typeof value === 'object' && value !== null) {
      result[key] = value[contentLocale] ?? value[FALLBACK_LOCALE];
    }
  }
  return result;
}
