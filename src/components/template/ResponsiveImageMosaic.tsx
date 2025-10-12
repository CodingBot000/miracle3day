"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";

type Props = {
  images: string[];
  onOpen: () => void; // 클릭 시 부모에 알림 (모달 오픈)
  className?: string;
};

export default function ResponsiveImageMosaic({ images, onOpen, className }: Props) {
  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const count = safeImages.length;
  const [current, setCurrent] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handlePrev = () => {
    setCurrent((prev) => Math.max(prev - 1, 0));
    sliderRef.current?.scrollTo({
      left: (current - 1) * sliderRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  const handleNext = () => {
    setCurrent((prev) => Math.min(prev + 1, safeImages.length - 1));
    sliderRef.current?.scrollTo({
      left: (current + 1) * sliderRef.current.clientWidth,
      behavior: "smooth",
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.clientWidth;
    const idx = Math.round(scrollLeft / width);
    setCurrent(idx);
  };

  // ---- 단일 이미지: 모든 사이즈 동일하게 꽉 채움
  if (count <= 1) {
    const src = safeImages[0] ?? "";
    return (
      <button
        type="button"
        onClick={onOpen}
        className={`block w-full overflow-hidden rounded-xl ${className ?? ""}`}
      >
        <div className="relative w-full aspect-[16/9] bg-gray-100">
          {src && (
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
        </div>
      </button>
    );
  }

  // ---- 모바일 슬라이더 (네비 + 도트)
  const MobileSlider = (
    <div className={`relative md:hidden ${className ?? ""}`}>
      <div
        ref={sliderRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-none scroll-smooth"
        style={{ height: '300px' }}
      >
        {safeImages.map((src, idx) => (
          <button
            key={idx}
            type="button"
            onClick={onOpen}
            className="relative min-w-full h-full snap-center overflow-hidden rounded-xl bg-gray-100"
          >
            <img
              src={src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          </button>
        ))}
      </div>

      {/* 좌우 네비 버튼 */}
      {current > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white px-2 py-1"
        >
          ‹
        </button>
      )}
      {current < safeImages.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white px-2 py-1"
        >
          ›
        </button>
      )}

      {/* 도트 인디케이터 */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {safeImages.map((_, idx) => (
          <div
            key={idx}
            className={`h-2 w-2 rounded-full ${
              idx === current ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );

  // ---- 데스크탑/태블릿 모자이크
const rightSources = safeImages.slice(1, 5);
const isTwo = count === 2;
const has5plus = count >= 5;

// 데스크탑/태블릿 모자이크 (65:35, 세로 낮게 고정)
const DesktopMosaic = (
  <div
    className={[
      "hidden md:grid gap-3",
      "grid-cols-[55%_45%]",
      className ?? ""
    ].join(" ")}
    style={{ height: '350px' }}
  >
    {/* 왼쪽 대표 이미지: 가운데 정렬 */}
    <button
      type="button"
      onClick={onOpen}
      className="relative overflow-hidden rounded-xl h-full"
    >
      {/* 가운데 정렬을 위해 flex 박스 + object-contain/cover 중 선택 */}
      <div className="flex items-center justify-center w-full h-full bg-gray-100">
        <img
          src={safeImages[0]}
          alt=""
          // 중앙 기준으로 채우되, 과한 크롭이 싫으면 object-contain 으로 교체 가능
          className="h-full w-full object-cover object-center"
          loading="lazy"
          decoding="async"
        />
      </div>
    </button>

    {/* 오른쪽: 2×2 썸네일 영역(빈 공간 없도록 h-full) */}
    <div className="h-full">
      {isTwo ? (
        // 2장 특수 규칙: 오른쪽 전체를 두 번째 이미지가 가득 채움
        <button
          type="button"
          onClick={onOpen}
          className="relative block w-full h-full overflow-hidden rounded-xl bg-gray-100"
        >
          <img
            src={safeImages[1]}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-center"
            loading="lazy"
            decoding="async"
          />
        </button>
      ) : (
        // 3~4장 또는 5장 이상: 2×2, 세로 꽉 채워서 간격 발생 방지
        <div className="grid h-full grid-cols-2 grid-rows-2 gap-3">
          {[0, 1, 2, 3].map((slot) => {
            const src = rightSources[slot];
            if (!src) {
              // 비어있는 칸(3~4장 케이스)은 빈 박스(간격만 유지, 높이 꽉 채움)
              return (
                <div
                  key={`empty-${slot}`}
                  className="w-full h-full rounded-xl bg-gray-100 flex items-center justify-center"
                >
                  <Image
                    src="/logo/logo_icon.png"
                    alt="Logo"
                    width={80}
                    height={80}
                    className="opacity-30"
                  />
                </div>
              );
            }
            return (
              <button
                key={slot}
                type="button"
                onClick={onOpen}
                className="relative w-full h-full overflow-hidden rounded-xl bg-gray-100"
              >
                <img
                  src={src}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover object-center"
                  loading="lazy"
                  decoding="async"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  </div>
);
  return (
    <>
      {MobileSlider}
      {DesktopMosaic}
    </>
  );
}
