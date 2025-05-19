"use client";

import React from "react";

export default function HeroVideos() {
  return (
    <div className="relative w-full overflow-hidden bg-black">
      <div className="mx-auto max-w-[1280px]">
        <div className="relative h-[60vh] md:h-[540px] w-full">
          <video
            className="absolute top-0 left-1/2 -translate-x-1/2 h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            poster="/video/hero_thumbnail.png"
          >
            {/* <source src="/video/hero_movie.webm" type="video/webm" /> */}
            <source src="/video/hero_movie.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* 오버레이 예시 */}
          <div className="absolute inset-0 flex items-center justify-center text-white text-center bg-black/30">
            <div>
              <h1 className="text-3xl md:text-5xl font-bold">Reveal Your Beauty</h1>
              <p className="mt-4 text-lg">Discover premium skincare & wellness experiences</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
