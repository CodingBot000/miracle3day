import * as React from "react";
import Image from "next/image";
import type { TopicWithAreas, Locale } from "@/app/models/treatmentData.dto";
import { TOPIC_IMAGES } from "@/app/[locale]/(site)/(pages)/treatment-protocol/treatment-landing-v2/category_images";

interface SkinTopicCardProps {
  topic: TopicWithAreas;
  locale: Locale;
  onAreaClick: (topic_id: string, area_id: string) => void;
  onTopicClick?: (topic_id: string, area_id: string) => void;
}

export default function SkinTopicCard({
  topic,
  locale,
  onAreaClick,
  onTopicClick,
}: SkinTopicCardProps) {
  const title = locale === "ko" ? topic.topic_title_ko : topic.topic_title_en;

  const topicImages = TOPIC_IMAGES[topic.topic_id] || TOPIC_IMAGES["lifting_firming"];
  const backgroundImage = topicImages[0] || "";

  const firstAreaId = topic.areas.length > 0 ? topic.areas[0].area_id : "";

  const handleTopicClick = () => {
    if (onTopicClick && firstAreaId) {
      onTopicClick(topic.topic_id, firstAreaId);
    }
  };

  const getAreaLabel = (area: TopicWithAreas["areas"][number]) =>
    locale === "ko" ? area.area_name_ko : area.area_name_en;

  // 최대 표시 칩 개수 (두 줄 안에 웬만하면 다 들어가도록)
  const MOBILE_VISIBLE_MAX = 4;
  const DESKTOP_VISIBLE_MAX = 6;

  const mobileVisibleAreas = topic.areas.slice(0, MOBILE_VISIBLE_MAX);
  const mobileHiddenCount = topic.areas.length - mobileVisibleAreas.length;

  const desktopVisibleAreas = topic.areas.slice(0, DESKTOP_VISIBLE_MAX);
  const desktopHiddenCount = topic.areas.length - desktopVisibleAreas.length;

  return (
    <div
      className="group cursor-pointer relative rounded-lg overflow-hidden bg-black/5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex flex-col"
      onClick={handleTopicClick}
    >
      {/* 이미지 + 타이틀 영역 */}
      <div className="relative w-full aspect-[4/3] flex-shrink-0">
        <Image
          src={backgroundImage}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {/* 어두운 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70" />

        {/* 토픽 타이틀만 이미지 위에 */}
        <div className="absolute inset-x-3 md:inset-x-4 bottom-3 md:bottom-4">
          <h2 className="text-base md:text-2xl font-bold text-white leading-tight drop-shadow-lg line-clamp-2">
            {title}
          </h2>
        </div>
      </div>

      {/* 모바일 태그 영역: 최대 두 줄, 넘치면 +N */}
      <div className="md:hidden px-2 pt-2 pb-2">
        <div className="flex flex-wrap gap-x-1 gap-y-0.5">
          {mobileVisibleAreas.map((area) => (
            <button
              key={area.area_id}
              onClick={(e) => {
                e.stopPropagation();
                onAreaClick(topic.topic_id, area.area_id);
              }}
              className="
                px-2 py-0.5 text-[11px] leading-none font-medium rounded-full 
                bg-white/90 backdrop-blur-sm
                text-[#8B4513] hover:bg-white
                transform hover:scale-105 transition-all duration-150
                shadow-sm
              "
            >
              {getAreaLabel(area)}
            </button>
          ))}

          {mobileHiddenCount > 0 && (
            <span
              className="
                px-2 py-0.5 text-[11px] leading-none font-medium rounded-full 
                bg-white/60 backdrop-blur-sm
                text-slate-700
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
          {desktopVisibleAreas.map((area) => (
            <button
              key={area.area_id}
              onClick={(e) => {
                e.stopPropagation();
                onAreaClick(topic.topic_id, area.area_id);
              }}
              className="
                px-2 py-0.5 text-[13px] leading-none font-medium rounded-full 
                bg-white/90 backdrop-blur-sm
                text-[#8B4513] hover:bg-white
                transform hover:scale-105 transition-all duration-150
                shadow-sm
              "
            >
              {getAreaLabel(area)}
            </button>
          ))}

          {desktopHiddenCount > 0 && (
            <span
              className="
                px-2 py-0.5 text-xs leading-none font-medium rounded-full 
                bg-white/60 backdrop-blur-sm
                text-slate-700
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
