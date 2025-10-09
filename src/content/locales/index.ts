import ko from './ko.json';
import en from './en.json';

export type ContentData = typeof ko;

export const kBeautyContent: Record<string, ContentData> = {
  ko,
  en,
};

export function getKBeautyContent(locale: string): ContentData {
  return kBeautyContent[locale] || kBeautyContent.ko;
}
