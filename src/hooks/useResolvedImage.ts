// src/hooks/useResolvedImage.ts
"use client";

import { useEffect, useState } from "react";
import { resolveImageUrl } from "@/lib/resolveImageUrl";

/**
 * 이미지 경로를 자동으로 변환하여 React state로 반환하는 Hook
 * presigned / public / 절대 URL 모두 지원
 */
export function useResolvedImage(raw: string) {
  const [resolved, setResolved] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    resolveImageUrl(raw)
      .then(url => mounted && setResolved(url))
      .catch(() => mounted && setResolved(null));
    return () => {
      mounted = false;
    };
  }, [raw]);

  return resolved;
}
