"use client";

import React, { useState } from "react";
import { REGIONS } from "@/constants/location";
import { CategoryNode } from "@/models/admin/category";
import { CategoryNodeRegion } from "@/app/[locale]/(site)/(pages)/contents/category/categoryNode";

interface LocationSelectProps {
  onSelect: (location: { key: number; label: { ko: string, en: string }; name: string }) => void;
  selectedLocation?: { key: number; label: { ko: string, en: string }; name: string } | null;
}

const LocationSelect: React.FC<LocationSelectProps> = ({ onSelect, selectedLocation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<CategoryNodeRegion | null>(null);

  const handleRegionSelect = (region: CategoryNodeRegion) => {
    setSelectedRegion(region);
  };

  const handleLocationSelect = (location: CategoryNodeRegion) => {
    onSelect({ key: location.key, label: location.label, name: location.name });
    setIsOpen(false);
    setSelectedRegion(null);
  };

  const handleBackToRegions = () => {
    setSelectedRegion(null);
  };

  return (
    <div className="relative w-full">
      {/* 선택된 location 표시 및 다이얼로그 열기 버튼 */}
      <div className="flex items-center w-full gap-2">
        <label className="min-w-[90px] font-medium">location</label>
        <div
          onClick={() => setIsOpen(true)}
          className="flex-1 px-3 py-2 border rounded outline-none transition cursor-pointer bg-white border-gray-300 hover:border-blue-500"
        >
          {selectedLocation ? selectedLocation.label.ko : "위치를 선택하세요"}
        </div>
      </div>

      {/* 다이얼로그 오버레이 */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full m-4 max-h-[80vh] overflow-hidden">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                {selectedRegion ? selectedRegion.label.ko : "지역 선택"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* 내용 */}
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {!selectedRegion ? (
                // 지역 선택
                <div className="space-y-2">
                  {REGIONS.map((region) => (
                    <button
                      key={region.key}
                      onClick={() => handleRegionSelect(region)}
                      className="w-full text-left px-4 py-3 border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {region.label.ko}
                    </button>
                  ))}
                </div>
              ) : (
                // 세부 위치 선택
                <div className="space-y-2">
                  <button
                    onClick={handleBackToRegions}
                    className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    ← 지역 선택으로 돌아가기
                  </button>
                  {selectedRegion.children?.map((location) => (
                    <button
                      key={location.key}
                      onClick={() => handleLocationSelect(location)}
                      className="w-full text-left px-4 py-3 border rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      {location.label.ko}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hidden input for form submission */}
      {selectedLocation && (
        <input type="hidden" name="location" value={selectedLocation.key} />
      )}
    </div>
  );
};

export default LocationSelect; 