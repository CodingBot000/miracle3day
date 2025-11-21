import * as React from "react";
import Image from "next/image";;
import type { TopicWithAreas, Locale } from "@/app/models/treatmentData.dto";
import DualImageCarousel from "@/components/atoms/DualImageCarousel";
import { TOPIC_IMAGES } from "@/app/(site)/treatment-protocol/treatment-landing-v2/category_images";

interface SkinTopicCardProps {
  topic: TopicWithAreas;
  locale: Locale;
  onAreaClick: (topic_id: string, area_id: string) => void;
  onTopicClick?: (topic_id: string, area_id: string) => void;
}


export default function SkinTopicCard({ topic, locale, onAreaClick, onTopicClick }: SkinTopicCardProps) {
  const title = locale === 'ko' ? topic.topic_title_ko : topic.topic_title_en;
  // const concernCopy = locale === 'ko' ? topic.concern_copy_ko : topic.concern_copy_en;

  // 해당 토픽에 할당된 이미지 배열 가져오기 (topic_id로 매칭)
  const topicImages = TOPIC_IMAGES[topic.topic_id] || TOPIC_IMAGES['lifting_firming'];
  
  // 첫 번째 이미지를 배경으로 사용
  const backgroundImage = topicImages[0] || '';

  // 첫 번째 area_id 가져오기
  const firstAreaId = topic.areas.length > 0 ? topic.areas[0].area_id : '';

  const handleTopicClick = () => {
    if (onTopicClick && firstAreaId) {
      onTopicClick(topic.topic_id, firstAreaId);
    }
  };
 
  return (
    <div 
      className="group cursor-pointer relative rounded-lg overflow-hidden hover:shadow-xl hover:scale-105 transition-all duration-300"
      onClick={handleTopicClick}
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
        {/* Topic Header */}
        <div className="mb-2">
          <h2 className="text-sm font-bold text-white mb-2 leading-tight drop-shadow-lg line-clamp-2">
            {title}
          </h2>
        </div>

        {/* Area Buttons */}
        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            {topic.areas.slice(0, 2).map((area) => (
              <button
                key={area.area_id}
                onClick={(e) => {
                  e.stopPropagation();
                  onAreaClick(topic.topic_id, area.area_id);
                }}
                className="
                  px-2 py-1 text-xs font-medium rounded-full 
                  bg-white/70 backdrop-blur-sm
                  text-[#8B4513] hover:bg-white
                  transform hover:scale-105 transition-all duration-200
                  shadow-lg hover:shadow-xl
                "
              >
                {locale === 'ko' ? area.area_name_ko : area.area_name_en}
              </button>
            ))}
            {topic.areas.length > 4 && (
              <span className="px-2 py-1 text-xs text-white/80 backdrop-blur-sm rounded-full bg-black/30">
                +{topic.areas.length - 4}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex relative z-10 min-h-[280px] p-8">
        <div className="flex flex-col justify-between w-full">
          {/* Topic Header */}
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
              {title}
            </h2>
          </div>

          {/* Area Buttons - bottom에 정렬 */}
          <div className="mt-auto">
            <div className="flex flex-wrap gap-2">
              {topic.areas.map((area) => (
                <button
                  key={area.area_id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onAreaClick(topic.topic_id, area.area_id);
                  }}
                  className="
                    px-3 py-1.5 text-sm font-medium rounded-full 
                    bg-white/90 backdrop-blur-sm
                    text-[#8B4513] hover:bg-white
                    transform hover:scale-105 transition-all duration-200
                    shadow-lg hover:shadow-xl
                  "
                >
                  {locale === 'ko' ? area.area_name_ko : area.area_name_en}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}