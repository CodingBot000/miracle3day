"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export default function WhyKoreaButton() {
  const { language } = useLanguage();
  const isKorean = language === 'ko';

  return (
    <div className="w-full flex justify-end mb-4">
      <Link
        href={`/contents/post/${language}/`}
        className="inline-flex items-center gap-1 md:gap-3 px-2 md:px-4 py-1 md:py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white text-xs md:text-sm font-semibold rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
      >
        <span>
          {isKorean
            ? '✨ Why Korea?'
            : '✨ Why Korea?'}
          <span className="hidden md:inline ml-1">
            {isKorean ? 'K-Beauty 가이드 보기' : 'View K-Beauty Guide'}
          </span>
        </span>
        <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </div>
  );
}
