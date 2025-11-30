"use client";

import { useLocale } from "next-intl";
import Link from "next/link";

export default function AgeGuideCTA() {
  const locale = useLocale();
  const isKorean = locale === 'ko';

  return (
    <div className="w-full flex justify-end">
      <Link
        href={`/treatment-based-age-guide`}
        className="inline-flex items-center gap-1 md:gap-3 px-2 md:px-4 py-1 md:py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white text-xs md:text-sm font-semibold rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
      >
        <span>
          {isKorean ? '연령대별 가이드' : 'Age Guide'}
          <span className="hidden md:inline ml-1">
            {isKorean ? '보기' : 'View'}
          </span>
        </span>
        <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </div>
  );
}
