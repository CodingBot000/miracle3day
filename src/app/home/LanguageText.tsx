"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface LanguageTextProps {
  className?: string;
}

export default function LanguageText({ className = "" }: LanguageTextProps) {
  const { language } = useLanguage();

  return (
    <span className={className}>
      {language === 'ko' ? '아름다움의 파트너들' : 'Your Beauty Partners'}
    </span>
  );
}
