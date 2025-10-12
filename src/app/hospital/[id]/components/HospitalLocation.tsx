"use client";

import { HospitalInfo } from "@/app/models/hospitalData.dto";
import { MapComponent } from "@/components/common/MapComponent";
import { useState } from "react";
import Image from "next/image";
import { buildMapLinks, openMapWithFallback, type MapPlatform } from "@/utils/mapLinkUtils";

interface HospitalLocationProps {
  hospitalInfo: HospitalInfo;
}

const HospitalLocation = ({ hospitalInfo }: HospitalLocationProps) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const handleCopy = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(type);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleMapClick = (platform: MapPlatform) => {
    const { scheme, fallback } = buildMapLinks(platform, hospitalInfo, "com.beauty.app");
    openMapWithFallback(scheme, fallback);
  };

  return (
    <div className="px-4 py-8 border-b-8 border-gray-50">
      <h2 className="text-lg font-semibold text-black mb-4 leading-[26.6px]">
        Hospital Location
      </h2>


      <div className="space-y-2 mb-4">
      {hospitalInfo.address_full_road_en && (
        <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-gray-800 min-w-[80px]">
              Road Name Address:
            </span>
            <span className="text-sm text-gray-800 flex-1">
              {hospitalInfo.address_full_road_en}
            </span>
            <button
              onClick={() => handleCopy(hospitalInfo.address_full_road_en!, 'road')}
              className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
              title="copy"
            >
              {copiedAddress === 'road' ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2H12C13.1046 2 14 2.89543 14 4V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V4C2 2.89543 2.89543 2 4 2Z" stroke="#6b7280" strokeWidth="1.5"/>
                  <path d="M10 6H14V10" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        )}
        {hospitalInfo.address_full_jibun_en && (
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-gray-800 min-w-[80px]">
              Lot Number Address:
            </span>
            <span className="text-sm text-gray-800 flex-1">
              {hospitalInfo.address_full_jibun_en}
            </span>
            <button
              onClick={() => handleCopy(hospitalInfo.address_full_jibun_en!, 'jibun')}
              className="ml-2 p-1 rounded hover:bg-gray-100 transition-colors"
              title="copy"
            >
              {copiedAddress === 'jibun' ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13.5 4.5L6 12L2.5 8.5" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2H12C13.1046 2 14 2.89543 14 4V12C14 13.1046 13.1046 14 12 14H4C2.89543 14 2 13.1046 2 12V4C2 2.89543 2.89543 2 4 2Z" stroke="#6b7280" strokeWidth="1.5"/>
                  <path d="M10 6H14V10" stroke="#6b7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          </div>
        )}
        {hospitalInfo.directions_to_clinic_en && (
         <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-gray-800 min-w-[80px]">
              Directions:
          </span>
          <span className="text-sm text-gray-800">
            {hospitalInfo.directions_to_clinic_en}
          </span>
        </div>
        )}
      </div>

      {/* 외부 지도 앱 버튼 */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => handleMapClick("google")}
          className="hover:opacity-80 transition-opacity"
          aria-label="Open in Google Maps"
        >
          <Image
            src="/icons/icon_map_google.webp"
            alt="Google Maps"
            width={60}
            height={60}
            className="rounded-lg"
          />
        </button>
        <button
          onClick={() => handleMapClick("naver")}
          className="hover:opacity-80 transition-opacity"
          aria-label="Open in Naver Map"
        >
          <Image
            src="/icons/icon_map_naver.webp"
            alt="Naver Map"
            width={60}
            height={60}
            className="rounded-lg"
          />
        </button>
        <button
          onClick={() => handleMapClick("kakao")}
          className="hover:opacity-80 transition-opacity"
          aria-label="Open in Kakao Map"
        >
          <Image
            src="/icons/icon_map_kakao.webp"
            alt="Kakao Map"
            width={60}
            height={60}
            className="rounded-lg"
          />
        </button>
      </div>

      <div className="w-full h-[328px] rounded-lg overflow-hidden">
        <MapComponent
          coordinates={[
            {
              latitude: hospitalInfo.latitude,
              longitude: hospitalInfo.longitude,
            },
          ]}
        />
      </div>
    </div>
  );
};

export default HospitalLocation;
