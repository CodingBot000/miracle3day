"use client";

import React from "react";

interface HeroVideosProps {
  children?: React.ReactNode;
}

export default function HeroVideos({ children }: HeroVideosProps) {
  return (
    <div className="relative w-full h-[30vh] md:h-[50vh] lg:h-[540px]">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/video/hero_video_thumbnail.png"
      >
        <source src="/video/hero_video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* 오버레이 - children으로 전달받음 */}
      {children}
    </div>
  );
}
