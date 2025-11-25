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

  // const parsedDate = typeof date === 'string' ? new Date(date) : date;

  //'2025-05-07T18:32:00.382948+00:00' 과 같이 들어오면 ISO 표준보다 정밀도가 너무 높아서 (.382948 ← 마이크로초까지 있음) new Date(...)가 이를 파싱하지 못하는 경우가 있습니다. JavaScript는 **마이크로초(6자리 소수)**를 제대로 처리하지 못하고, **밀리초(3자리)**까지만 지원


  const cleaned = typeof date === "string" ? date.replace(/\.\d{6}/, "") : date;
  log.debug(`formatData cleaned: ${cleaned} origin : ${date}`);
  const parsedDate = typeof cleaned === "string" ? new Date(cleaned) : cleaned;


  return format(parsedDate, formatString, {
    locale: localeMap[locale],
  });
}
