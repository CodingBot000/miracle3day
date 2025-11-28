/**
 * i18n 유틸리티 함수
 * JSONB 형식의 다국어 필드를 언어에 따라 반환
 */

export type Language = 'ko' | 'en';

/**
 * JSONB 형식의 다국어 필드를 언어에 따라 반환
 * @param field - JSONB 필드 (string 또는 { ko: string, en: string })
 * @param language - 언어 ('ko' | 'en' 또는 string)
 * @returns 해당 언어의 문자열
 */
export function getLocalizedText(
  field: string | { ko?: string; en?: string } | undefined,
  language: string = 'en'
): string {
  if (!field) return '';

  // 문자열인 경우 그대로 반환 (하위 호환성)
  if (typeof field === 'string') {
    return field;
  }

  // JSONB 객체인 경우 언어에 따라 반환
  if (typeof field === 'object') {
    const lang = language as Language;
    return field[lang] || field.en || field.ko || '';
  }

  return '';
}

