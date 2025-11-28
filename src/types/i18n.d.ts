// src/types/i18n.d.ts
import en from '@/messages/en.json';

type Messages = typeof en;

declare global {
  // next-intl이 사용하는 타입
  interface IntlMessages extends Messages {}
}
