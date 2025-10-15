"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";

type Size = "sm" | "md" | "lg" | number;

export default function BackButton({
  size = "md",          // 버튼 크기 (sm | md | lg | 숫자 px)
  strokeWidth = 2.5,    // 아이콘 선 굵기
  className,
}: {
  size?: Size;
  strokeWidth?: number;
  className?: string;
}) {
  const router = useRouter();

  // 미리 정의된 텍스트 크기 매핑
  const iconSize =
    typeof size === "number"
      ? size
      : size === "sm"
      ? 18
      : size === "lg"
      ? 28
      : 22; // md 기본값

  return (
    <button
      onClick={() => router.back()}
      aria-label="뒤로가기"
      className={clsx(
        "inline-flex items-center justify-center rounded-full hover:bg-gray-100",
        "text-gray-700 transition-colors",
        className
      )}
      style={{
        width: iconSize + 12,  // 터치 영역 확보
        height: iconSize + 12,
      }}
    >
      <ArrowLeft size={iconSize} strokeWidth={strokeWidth} />
    </button>
  );
}
