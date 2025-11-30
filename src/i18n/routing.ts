import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = ['en', 'ko', 'ja', 'zh-CN', 'zh-TW'] as const;
// export const locales = ['en', 'ko'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
  ja: '日本語',
  'zh-CN': '简体中文',
  'zh-TW': '繁體中文',
};

export const routing = defineRouting({
  locales,
  defaultLocale: 'en',
  localePrefix: 'always', // 항상 URL에 locale 포함
});

// 타입 안전한 네비게이션 헬퍼
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
