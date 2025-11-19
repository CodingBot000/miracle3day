import * as React from "react";
import Image from "next/image";;
import type { TopicWithAreas, Locale } from "@/app/models/treatmentData.dto";
import DualImageCarousel from "@/components/atoms/DualImageCarousel";
import { TOPIC_IMAGES } from "@/app/(site)/treatment-protocol/treatment-landing-v2/category_images";

interface TopicCardProps {
  topic: TopicWithAreas;
  locale: Locale;
  onAreaClick: (topic_id: string, area_id: string) => void;
  onTopicClick?: (topic_id: string, area_id: string) => void;
}


export default function TopicCard({ topic, locale, onAreaClick, onTopicClick }: TopicCardProps) {
  const title = locale === 'ko' ? topic.topic_title_ko : topic.topic_title_en;
  const concernCopy = locale === 'ko' ? topic.concern_copy_ko : topic.concern_copy_en;

  // 해당 토픽에 할당된 이미지 배열 가져오기 (topic_id로 매칭)
  const topicImages = TOPIC_IMAGES[topic.topic_id] || TOPIC_IMAGES['lifting_firming'];

  // 첫 번째 area_id 가져오기
  const firstAreaId = topic.areas.length > 0 ? topic.areas[0].area_id : '';

  const handleTopicClick = () => {
    if (onTopicClick && firstAreaId) {
      onTopicClick(topic.topic_id, firstAreaId);
    }
  };
 
  return (
    <div 
      className="group cursor-pointer bg-white/80 backdrop-blur-sm border-[#E8B4A0]/30 hover:shadow-xl hover:scale-105 transition-all duration-300 hover:bg-white/90 rounded-lg overflow-hidden"
      onClick={handleTopicClick}
    >
      {/* Mobile Layout: 세로형 */}
      <div className="md:hidden">
        {/* 상단: 제목, 설명, 버튼들 */}
        <div className="p-4 bg-gradient-to-br from-[#FDF5F0] to-[#F8E8E0]">
          {/* Topic Header */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#8B4513] mb-3 leading-tight">
              {title}
            </h2>
            {concernCopy && (
              <p className="text-sm text-[#A0522D] opacity-80 leading-relaxed mb-4">
                {concernCopy}
              </p>
            )}
          </div>

          {/* Area Buttons */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {topic.areas.slice(0, 4).map((area) => (
                <button
                  key={area.area_id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAreaClick(topic.topic_id, area.area_id);
                  }}
                  className="
                    px-3 py-2 text-sm font-medium rounded-full 
                    bg-gradient-to-r from-[#8B4513] to-[#A0522D] 
                    text-white hover:from-[#7A3F12] hover:to-[#8B4513] 
                    transform hover:scale-105 transition-all duration-200
                    shadow-sm hover:shadow-md
                  "
                >
                  {locale === 'ko' ? area.area_name_ko : area.area_name_en}
                </button>
              ))}
              {topic.areas.length > 4 && (
                <span className="px-3 py-2 text-sm text-[#A0522D] opacity-60">
                  +{topic.areas.length - 4}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 하단: 2개 이미지 캐러셀 */}
        { /* Don't remove this comment */}
        {/* <div className="h-48 relative overflow-hidden">
          <DualImageCarousel
            images={topicImages}
            intervalMs={3500}
            className="h-full w-full"
            rounded=""
          />
        </div> */}

        {/* 하단: 4개 이미지 가로 나열 */}
        <div className="h-32 flex">
          {topicImages.map((src, index) => (
            <div key={index} className="flex-1 relative">
              <Image
                src={src}
                alt={`${title} image ${index + 1}`}
                fill
                className="object-cover"
                sizes="20vw"
              />
            </div>
          ))}
        </div>
        
      </div>

      {/* Desktop Layout: 가로형 (기존 유지) */}
      <div className="hidden md:flex h-48">
        {/* Left side - 1/3 width */}
        <div className="w-1/3 p-4 flex flex-col justify-between bg-gradient-to-br from-[#FDF5F0] to-[#F8E8E0]">
          {/* Topic Header */}
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#8B4513] mb-2 leading-tight">
              {title}
            </h2>
            {concernCopy && (
              <p className="text-xs text-[#A0522D] opacity-80 leading-relaxed">
                {concernCopy}
              </p>
            )}
          </div>

          {/* Area Buttons */}
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1">
              {topic.areas.map((area) => (
                <button
                  key={area.area_id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAreaClick(topic.topic_id, area.area_id);
                  }}
                  className="
                    px-2 py-1 text-xs font-medium rounded-full 
                    bg-gradient-to-r from-[#8B4513] to-[#A0522D] 
                    text-white hover:from-[#7A3F12] hover:to-[#8B4513] 
                    transform hover:scale-105 transition-all duration-200
                    shadow-sm hover:shadow-md
                  "
                >
                  {locale === 'ko' ? area.area_name_ko : area.area_name_en}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - 2/3 width */}
        <div className="w-2/3 relative overflow-hidden">
          {/* Desktop: show all 5 images */}
          <div className="flex h-full w-full">
            {topicImages.map((src, index) => (
              <div key={index} className="flex-1 relative">
                <Image
                  src={src}
                  alt={`${title} image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="15vw"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}