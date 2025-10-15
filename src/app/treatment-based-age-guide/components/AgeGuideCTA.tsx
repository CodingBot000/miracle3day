"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export default function AgeGuideCTA() {
  const { language } = useLanguage();
  const isKorean = language === 'ko';

  return (
    <div className="w-full flex justify-center mt-5 mb-4">
      <Link
        href={`/treatment-based-age-guide`}
        className="inline-flex items-center gap-1 md:gap-3 px-14 md:px-6 py-3 md:py-2 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 text-white text-sm md:text-sm font-semibold rounded-full shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
      >
        <span>
          
          {/* <span className="hidden md:inline ml-1"> */}
            {isKorean ? '연령대별 안티에이징 가이드 보기' : 'View Age-Based Anti-Aging Guide'}
          {/* </span> */}
        </span>
        <svg className="w-4 h-4 md:w-5 md:h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
    </div>
  );
}
