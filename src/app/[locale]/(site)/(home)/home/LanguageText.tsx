"use client";

import { useLocale } from "next-intl";

interface LanguageTextProps {
  className?: string;
}

export default function LanguageText({ className = "" }: LanguageTextProps) {
  const locale = useLocale();

  return (
    <span className={className}>
      {locale === 'ko' ? '아름다움의 파트너들' : 'Your Beauty Partners'}
    </span>
  );
}
