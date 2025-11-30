"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { SurgeryCategory, Locale } from "@/app/models/surgeryData.dto";
import { SURGERY_IMAGES } from "@/app/[locale]/(site)/(pages)/treatment-protocol/treatment-landing-v2/category_images";

interface SurgeryTopicCardProps {
  data: SurgeryCategory;
  locale: Locale;
  categoryIndex: number;
}

export default function SurgeryTopicCard({
  data,
  locale,
  categoryIndex,
}: SurgeryTopicCardProps) {
  const router = useRouter();

  // 해당 카테고리에 할당된 이미지 배열 가져오기
  const surgeryImages = SURGERY_IMAGES[categoryIndex] || SURGERY_IMAGES[0];
  const backgroundImage = surgeryImages[0] || "";

  const title =
    locale === "ko" ? data.category_title_ko : data.category_title_en;

  const getAreaLabel = (surgery: SurgeryCategory["surgeries"][number]) =>
    locale === "ko" ? surgery.area_name_ko : surgery.area_name_en;

  const handleSurgeryClick = (
    e: React.MouseEvent,
    surgeryId: string
  ): void => {
    e.stopPropagation(); // 카드 클릭 막기
    router.push(
      `/treatment-protocol/surgery/${surgeryId}?category=${data.category}`
    );
  };

  // 카드 전체 클릭 시: 첫 번째 시술로 이동
  const handleCardClick = (): void => {
    if (data.surgeries.length > 0) {
      const firstSurgeryId = data.surgeries[0].id;
      router.push(
        `/treatment-protocol/surgery/${firstSurgeryId}?category=${data.category}`
      );
    }
  };

  // 태그 개수 제한 (두 줄 안에 웬만하면 들어가도록)
  const MOBILE_VISIBLE_MAX = 4;
  const DESKTOP_VISIBLE_MAX = 6;

  const mobileVisible = data.surgeries.slice(0, MOBILE_VISIBLE_MAX);
  const mobileHiddenCount = data.surgeries.length - mobileVisible.length;

  const desktopVisible = data.surgeries.slice(0, DESKTOP_VISIBLE_MAX);
  const desktopHiddenCount = data.surgeries.length - desktopVisible.length;

  return (
    <div
      onClick={handleCardClick}
      className="group relative rounded-lg overflow-hidden bg-black/5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
    >
      {/* 이미지 + 카테고리 타이틀 영역 */}
      <div className="relative h-[220px] md:h-[260px]">
        {/* 배경 이미지 */}
        <Image
          src={backgroundImage}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* 어두운 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />

        {/* 타이틀만 이미지 위에 */}
        <div className="absolute inset-x-3 md:inset-x-4 bottom-3 md:bottom-4">
          <h2 className="text-base md:text-2xl font-bold text-white leading-tight drop-shadow-lg line-clamp-2">
            {title}
          </h2>
        </div>
      </div>

      {/* 모바일 태그 영역: 최대 두 줄, 넘치면 +N */}
      <div className="md:hidden px-2 pt-2 pb-2">
        <div className="flex flex-wrap gap-x-1 gap-y-0.5">
          {mobileVisible.map((surgery) => (
            <button
              key={surgery.id}
              onClick={(e) => handleSurgeryClick(e, surgery.id)}
              className="
                px-2 py-0.5 text-[11px] leading-none font-medium rounded-full
                bg-white/90 backdrop-blur-sm
                text-[#2563EB] hover:bg-white
                transform hover:scale-105 transition-all duration-150
                shadow-sm
              "
            >
              {getAreaLabel(surgery)}
            </button>
          ))}

          {mobileHiddenCount > 0 && (
            <span
              className="
                px-2 py-0.5 text-[11px] leading-none font-medium rounded-full
                bg-white/60 backdrop-blur-sm
                text-white
              "
            >
              +{mobileHiddenCount}
            </span>
          )}
        </div>
      </div>

      {/* 데스크탑 태그 영역: 패딩/갭 최소화 + +N */}
      <div className="hidden md:block px-3 py-2">
        <div className="flex flex-wrap gap-x-1 gap-y-0.5">
          {desktopVisible.map((surgery) => (
            <button
              key={surgery.id}
              onClick={(e) => handleSurgeryClick(e, surgery.id)}
              className="
                px-2 py-0.5 text-[13px] leading-none font-medium rounded-full
                bg-white/90 backdrop-blur-sm
                text-[#2563EB] hover:bg-white
                transform hover:scale-105 transition-all duration-150
                shadow-sm
              "
            >
              {getAreaLabel(surgery)}
            </button>
          ))}

          {desktopHiddenCount > 0 && (
            <span
              className="
                px-2 py-0.5 text-xs leading-none font-medium rounded-full
                bg-white/60 backdrop-blur-sm
                text-white
              "
            >
              +{desktopHiddenCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
