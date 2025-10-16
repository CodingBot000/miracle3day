"use client";

import { useCookieLanguage } from "@/hooks/useCookieLanguage";

interface LanguageTextProps {
  className?: string;
}

export default function LanguageText({ className = "" }: LanguageTextProps) {
  const { language } = useCookieLanguage();

  return (
    <span className={className}>
      {language === 'ko' ? '아름다움의 파트너들' : 'Your Beauty Partners'}
    </span>
  );
}
