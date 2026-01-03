/**
 * 다국어 요일 약어
 * 모든 언어는 1-3글자로 표시
 */
export const weekdayAbbreviations: Record<string, string[]> = {
  ko: ['일', '월', '화', '수', '목', '금', '토'],
  en: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
  ja: ['日', '月', '火', '水', '木', '金', '土'],
  zh: ['日', '一', '二', '三', '四', '五', '六'],
  es: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
  fr: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
  de: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
  th: ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'],
  vi: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
};

/**
 * 기본값: 영어
 */
export const getWeekdayAbbr = (locale: string): string[] => {
  return weekdayAbbreviations[locale] || weekdayAbbreviations.en;
};
