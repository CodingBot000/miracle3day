'use client';

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { SurgeryCategory, Locale } from "@/app/models/surgeryData.dto";
import { SURGERY_IMAGES } from "@/app/(site)/treatment-protocol/treatment-landing-v2/category_images";

interface SurgeryTopicCardProps {
  data: SurgeryCategory;
  locale: Locale;
  categoryIndex: number;
}

export default function SurgeryTopicCard({ data, locale, categoryIndex }: SurgeryTopicCardProps) {
  const router = useRouter();

  // 해당 카테고리에 할당된 이미지 배열 가져오기
  const surgeryImages = SURGERY_IMAGES[categoryIndex] || SURGERY_IMAGES[0];
  
  // 첫 번째 이미지를 배경으로 사용
  const backgroundImage = surgeryImages[0] || '';

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
  // console.log("SurgeryCard data:", data);
  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer"
    >
      {/* 배경 이미지 */}
      <div className="absolute inset-0">
        <Image
          src={backgroundImage}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 20vw"
        />
        {/* 어두운 오버레이로 텍스트 가독성 향상 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden relative z-10 min-h-[180px] flex flex-col justify-between p-3">
        {/* Category Header */}
        <div className="mb-2">
          <h2 className="text-sm font-bold text-white mb-2 leading-tight drop-shadow-lg line-clamp-2">
            {title}
          </h2>
        </div>

        {/* Surgery List */}
        <div className="flex flex-wrap gap-1">
          {data.surgeries.slice(0, 2).map((surgery) => (
            <button
              key={surgery.id}
              onClick={(e) => handleSurgeryClick(e, surgery.id)}
              className="
                px-2 py-1 text-xs font-medium rounded-full
                bg-white/90 backdrop-blur-sm
                text-[#2563EB] hover:bg-white
                transform hover:scale-105 transition-all duration-200
                shadow-lg hover:shadow-xl
              "
            >
              {locale === 'ko' ? surgery.area_name_ko : surgery.area_name_en}
            </button>
          ))}
          {data.surgeries.length > 2 && (
            <span className="px-2 py-1 text-xs text-white/80 backdrop-blur-sm rounded-full bg-black/30">
              +{data.surgeries.length - 2}
            </span>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex relative z-10 min-h-[280px] p-8">
        <div className="flex flex-col justify-between w-full">
          {/* Category Header */}
          <div className="mb-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
              {title}
            </h2>
          </div>

          {/* Surgery List - Pill Buttons */}
          <div className="flex flex-wrap gap-2">
            {data.surgeries.map((surgery) => (
              <button
                key={surgery.id}
                onClick={(e) => handleSurgeryClick(e, surgery.id)}
                className="
                  px-3 py-1.5 text-sm font-medium rounded-full
                  bg-white/90 backdrop-blur-sm
                  text-[#2563EB] hover:bg-white
                  transform hover:scale-105 transition-all duration-200
                  shadow-lg hover:shadow-xl
                "
              >
                {locale === 'ko' ? surgery.area_name_ko : surgery.area_name_en}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
