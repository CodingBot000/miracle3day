// src/types/i18n.d.ts
import common from '@/locales/en/common.json';
import home from '@/locales/en/home.json';
import whykbeauty from '@/locales/en/whykbeauty.json';

type Messages = typeof common & typeof home & typeof whykbeauty;

declare global {
  // next-intl이 사용하는 타입
  interface IntlMessages extends Messages {}
}
