"use client";

import React from "react";

interface HeroVideosProps {
  children?: React.ReactNode;
}

export default function HeroVideos({ children }: HeroVideosProps) {
  return (
    <div className="relative w-full h-[45vh] md:h-[60vh] lg:h-[700px] md:rounded-lg overflow-hidden">
      <video
        className="absolute inset-0 h-full w-full object-cover object-center"
        style={{
          minWidth: "100%",
          minHeight: "100%",
        }}
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
