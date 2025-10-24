"use client";

import { useEffect, useState } from "react";
import Image from "next/image";;

// 이미지 파일 경로 배열
const heroImages = [
  "/heroImg/hero0.jpg",
  "/heroImg/hero1.jpg",
  "/heroImg/hero2.jpg",
  "/heroImg/hero3.jpg",
  "/heroImg/hero4.jpg",
  "/heroImg/hero5.jpg",
  "/heroImg/hero6.jpg",
];

export const Hero = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [activeOpacity, setActiveOpacity] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      const fadeOutInterval = setInterval(() => {
        setActiveOpacity((prev) => {
          const newOpacity = Math.max(0, prev - 0.02);
          if (newOpacity <= 0) {
            clearInterval(fadeOutInterval);
            setActiveIndex(nextIndex);
            setNextIndex((nextIndex + 1) % heroImages.length);
            setActiveOpacity(1);
          }
          return newOpacity;
        });
      }, 10);
    }, 5000);

    return () => clearInterval(interval);
  }, [nextIndex, isVisible]);

  return (
    <div className="w-full max-w-full overflow-hidden relative bg-[#f7f8fa] mb-12">
      <div
        className="
          w-full max-w-[1024px] mx-auto relative overflow-hidden 
          aspect-[16/9] rounded-[12px] sm:aspect-[4/3] sm:rounded-[8px]
        "
      >
        {/* 다음 이미지 (항상 뒤에 있음) */}
        <div className="absolute top-0 left-0 w-full h-full z-[1]">
          <Image
            src={heroImages[nextIndex]}
            alt={`Next Hero Image`}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover object-center w-full h-full"
          />
        </div>

        {/* 현재 이미지 (앞에 있으며 서서히 투명해짐) */}
        <div className="absolute top-0 left-0 w-full h-full z-[2]">
          <Image
            src={heroImages[activeIndex]}
            alt={`Current Hero Image`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover object-center w-full h-full"
            style={{
              opacity: activeOpacity,
              transition: "opacity 10ms linear",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Hero;
