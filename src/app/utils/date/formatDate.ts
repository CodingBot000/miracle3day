// src/app/utils/date/formatDate.ts
import { format } from 'date-fns';
import { enUS, ko } from 'date-fns/locale';

type SupportedLocale = 'en' | 'ko';

interface FormatDateOptions {
  formatString?: string;      // 기본값: yyyy-MM-dd
  locale?: SupportedLocale;   // 기본값: en
}

const localeMap = {
  en: enUS,
  ko: ko,
};

export function formatDate(
  date: Date | string,
  options?: FormatDateOptions
): string {
  const {
    formatString = 'yyyy-MM-dd',
    locale = 'en',
  } = options || {};

  const parsedDate = typeof date === 'string' ? new Date(date) : date;

  return format(parsedDate, formatString, {
    locale: localeMap[locale],
  });
}
