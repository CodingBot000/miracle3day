"use client";

import Link from "next/link";
import * as React from "react";
import type { CategoryItem } from "./categories";

export function CategoryCard({ item }: { item: CategoryItem }) {
  const hasVideo = item.media?.type === "video" && !!item.media.src;
  const hasImage = item.media?.type === "image" && !!item.media.src;

  return (
    <article
      className="group relative overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-md"
      aria-label={`${item.title_ko} | ${item.title_en}`}
    >
      {/* Media */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {/* Accent gradient backdrop (visible behind media and as fallback) */}
        <div
          className="absolute inset-0"
          style={{
            background:
              item.accent?.gradient ||
              "linear-gradient(135deg, #fce7f3 0%, #eef2ff 100%)",
          }}
        />

        {/* Media layer */}
        {hasVideo ? (
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={item.media!.src}
            autoPlay
            loop
            muted
            playsInline
            aria-label={item.media!.alt || item.title_en}
          />
        ) : hasImage ? (
          // Use <img> instead of next/image to avoid remotePatterns setup
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={item.media!.src}
            alt={item.media!.alt || item.title_en}
            loading="lazy"
          />
        ) : null}

        {/* Soft overlay to keep text legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

        {/* Shine/glare effect on hover */}
        <div className="pointer-events-none absolute -inset-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{
          background:
            "radial-gradient(1200px 400px at 10% -10%, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 60%)",
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 -mt-16 mx-3 rounded-2xl bg-white/90 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/70 shadow">
        <div className="flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: item.accent?.dot || "#ec4899" }}
            aria-hidden
          />
          <h3 className="text-base sm:text-lg font-semibold tracking-tight text-gray-900">
            {item.title_ko}
          </h3>
        </div>
        <p className="mt-0.5 text-xs text-gray-500">{item.title_en}</p>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.subtitle_ko}</p>

        <div className="mt-4 flex items-center justify-between">
          <Link
            href={item.href || `/care/${item.slug}`}
            className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{
              background:
                item.accent?.button || "linear-gradient(90deg,#ec4899,#8b5cf6)",
            }}
          >
            {item.cta || "자세히 보기"}
          </Link>

          {/* Optional right chip */}
          {item.badge && (
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
              {item.badge}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}