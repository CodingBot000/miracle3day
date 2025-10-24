// src/components/SmartImage.tsx
"use client";

import Image, { ImageProps } from "next/image";
import { useResolvedImage } from "@/hooks/useResolvedImage";

/**
 * SmartImage
 * 기존 <Image>와 동일하게 사용하지만,
 * src 값이 presigned / 로컬 / 절대경로 모두 자동 처리됩니다.
 */
export function SmartImage(props: ImageProps) {
  const resolved = useResolvedImage(props.src as string);

  if (!resolved) {
    return (
      <div className="flex items-center justify-center bg-gray-100 text-gray-400 text-sm">
        Loading...
      </div>
    );
  }

  return <Image {...props} src={resolved} />;
}
