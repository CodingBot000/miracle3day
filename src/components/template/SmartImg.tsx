// src/components/SmartImg.tsx
"use client";

import React, { ImgHTMLAttributes, useEffect, useState } from "react";
import { resolveImageUrl } from "@/lib/resolveImageUrl";

/**
 * SmartImg
 * 일반 <img> 태그용 버전.
 * src가 presigned / 로컬 / 절대경로일 때 모두 자동 처리.
 */
export function SmartImg(props: ImgHTMLAttributes<HTMLImageElement>) {
  const { src, alt, ...rest } = props;
  const [resolved, setResolved] = useState<string | null>(null);

  useEffect(() => {
    if (!src) return;
    let mounted = true;
    resolveImageUrl(src as string)
      .then((url) => mounted && setResolved(url))
      .catch(() => mounted && setResolved(null));
    return () => {
      mounted = false;
    };
  }, [src]);

  if (!resolved) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 text-gray-400 text-sm"
        style={{ width: rest.width || "100%", height: rest.height || "auto" }}
      >
        Loading...
      </div>
    );
  }

  return <img {...rest} src={resolved} alt={alt || ""} />;
}
