"use client";

import { extractYouTubeChannelInfo } from "@/utils/snsUtils";
import { Youtube } from "lucide-react";
import Image from "next/image";

interface HospitalYouTubePreviewProps {
  youtube: string;
}

const HospitalYouTubePreview = ({ youtube }: HospitalYouTubePreviewProps) => {
  const channelInfo = extractYouTubeChannelInfo(youtube);

  if (!channelInfo) return null;

  const handleClick = () => {
    window.open(channelInfo.channelUrl, '_blank');
  };

  // YouTube 기본 로고/썸네일 사용
  return (
    <div className="px-4 py-6 border-b-8 border-gray-50">
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">YouTube Channel</h2>

        <button
          onClick={handleClick}
          className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group"
        >
          {/* 상단: YouTube 아이콘과 채널명 */}
          <div className="p-4 flex items-center gap-3 bg-gradient-to-r from-red-50 to-white">
            <div className="flex-shrink-0 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <Youtube className="w-10 h-10 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-base font-medium text-gray-900 group-hover:text-red-600 transition-colors">
                {channelInfo.username
                  ? `@${channelInfo.username}`
                  : 'Visit YouTube Channel'}
              </p>
              <p className="text-sm text-gray-500">Click to view channel</p>
            </div>
            <svg
              className="w-6 h-6 text-gray-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* 하단: 프리뷰 영역 */}
          <div className="relative h-48 bg-gradient-to-br from-red-100 via-pink-50 to-purple-50 flex items-center justify-center">
            {/* YouTube 플레이 버튼 오버레이 */}
            <div className="relative">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-xl">
                <svg
                  className="w-10 h-10 text-white ml-1"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="absolute inset-0 bg-red-600 rounded-full animate-ping opacity-20"></div>
            </div>

            {/* 장식적인 그리드 패턴 */}
            <div className="absolute inset-0 opacity-10">
              <div className="grid grid-cols-6 grid-rows-4 w-full h-full gap-2 p-4">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className="bg-gray-400 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </button>

        <p className="text-xs text-gray-500 text-center">
          Check out our YouTube channel for more videos and updates
        </p>
      </div>
    </div>
  );
};

export default HospitalYouTubePreview;
