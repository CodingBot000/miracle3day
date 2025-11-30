'use client';

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { SurgeryCategory, Locale } from "@/app/models/surgeryData.dto";
import { SURGERY_IMAGES } from "@/app/[locale]/(site)/(pages)/treatment-protocol/treatment-landing-v2/category_images";

interface SurgeryCardProps {
  data: SurgeryCategory;
  locale: Locale;
  categoryIndex: number;
}

export default function SurgeryCard({ data, locale, categoryIndex }: SurgeryCardProps) {
  const router = useRouter();

  // 해당 카테고리에 할당된 이미지 배열 가져오기
  const surgeryImages = SURGERY_IMAGES[categoryIndex] || SURGERY_IMAGES[0];

  const handleSurgeryClick = (e: React.MouseEvent, surgeryId: string) => {
    e.stopPropagation(); // Prevent card click event
    router.push(`/treatment-protocol/surgery/${surgeryId}?category=${data.category}`);
  };

  // Handle card click - navigate to first surgery
  const handleCardClick = (e: React.MouseEvent) => {
    // Only handle click if it's on the card itself, not on buttons
    if ((e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }

    if (data.surgeries.length > 0) {
      const firstSurgeryId = data.surgeries[0].id;
      router.push(`/treatment-protocol/surgery/${firstSurgeryId}?category=${data.category}`);
    }
  };

  const title = locale === 'ko' ? data.category_title_ko : data.category_title_en;
  // const concernCopy = locale === 'ko' ? data.concern_copy_ko : data.concern_copy_en;
  // log.debug("SurgeryCard data:", data);
  return (
    <div
      onClick={handleCardClick}
      className="group bg-white/80 backdrop-blur-sm border-[#E8B4A0]/30 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-white/90 rounded-lg overflow-hidden cursor-pointer"
    >
      {/* Mobile Layout: 세로형 */}
      <div className="md:hidden">
        {/* 상단: 제목, 설명, 수술 목록 */}
        <div className="p-4 bg-gradient-to-br from-[#F0F5FD] to-[#E0E8F8]">
          {/* Category Header */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
         
              <h2 className="text-xl font-bold text-[#2563EB] leading-tight">
                {title}
              </h2>
            </div>
            {/* {concernCopy && (
              <p className="text-sm text-[#4B5563] opacity-80 leading-relaxed mb-4 italic">
                {concernCopy}
              </p>
            )} */}
          </div>

          {/* Surgery List */}
          <div className="flex flex-wrap gap-2">
            {data.surgeries.map((surgery) => (
              <button
                key={surgery.id}
                onClick={(e) => handleSurgeryClick(e, surgery.id)}
                className="
                  px-3 py-2 text-sm font-medium rounded-full
                  bg-gradient-to-r from-[#2563EB] to-[#3B82F6]
                  text-white hover:from-[#1E40AF] hover:to-[#2563EB]
                  transform hover:scale-105 transition-all duration-200
                  shadow-sm hover:shadow-md
                "
              >
                {locale === 'ko' ? surgery.area_name_ko : surgery.area_name_en}
              </button>
            ))}
          </div>
        </div>

        {/* 하단: 4개 이미지 가로 나열 */}
        <div className="h-32 flex">
          {surgeryImages.map((src, index) => (
            <div key={index} className="flex-1 relative">
              <Image
                src={src}
                alt={`${title} image ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="25vw"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Layout: 가로형 */}
      <div className="hidden md:flex">
        {/* 왼쪽: 수술 정보 */}
        <div className="flex-1 p-6 bg-gradient-to-br from-[#F0F5FD] to-[#E0E8F8]">
          {/* Category Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">💉</span>
              <h2 className="text-2xl font-bold text-[#2563EB]">
                {title}
              </h2>
            </div>
            {/* {concernCopy && (
              <p className="text-lg text-[#4B5563] opacity-80 leading-relaxed italic">
                {concernCopy}
              </p>
            )} */}
          </div>

          {/* Surgery List - Pill Buttons */}
          <div className="flex flex-wrap gap-2">
            {data.surgeries.map((surgery) => (
              <button
                key={surgery.id}
                onClick={(e) => handleSurgeryClick(e, surgery.id)}
                className="
                  px-3 py-2 text-sm font-medium rounded-full
                  bg-gradient-to-r from-[#2563EB] to-[#3B82F6]
                  text-white hover:from-[#1E40AF] hover:to-[#2563EB]
                  transform hover:scale-105 transition-all duration-200
                  shadow-sm hover:shadow-md
                "
              >
                {locale === 'ko' ? surgery.area_name_ko : surgery.area_name_en}
              </button>
            ))}
          </div>
        </div>

        {/* 오른쪽: 이미지 그리드 */}
        <div className="w-64 grid grid-cols-2 gap-0">
          {surgeryImages.map((src, index) => (
            <div key={index} className="relative aspect-square">
              <Image
                src={src}
                alt={`${title} image ${index + 1}`}
                fill
                style={{ objectFit: 'cover' }}
                sizes="128px"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
