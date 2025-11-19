// src/components/template/modal/ImageCompressionModal.tsx
"use client";

import React from "react";
import { useCookieLanguage } from "@/hooks/useCookieLanguage";

export type ImageCompressionModalStatus = "idle" | "compressing" | "done" | "error";

interface ImageCompressionModalProps {
  open: boolean;
  totalCount: number;
  processedCount: number;
  status: ImageCompressionModalStatus;
  hasTimeoutError?: boolean;
  onClose: () => void;
}

/**
 * 이미지 압축 진행 상태를 보여주는 공용 모달
 * - 디자인은 프로젝트 UI 시스템(shadcn, tailwind 등)에 맞춰 커스터마이즈 가능
 * - 여기서는 최소한의 스타일로만 구성
 */
const ImageCompressionModal: React.FC<ImageCompressionModalProps> = ({
  open,
  totalCount,
  processedCount,
  status,
  hasTimeoutError,
  onClose,
}) => {
  const { language: lang } = useCookieLanguage(); // 예: "ko" | "en"

  if (!open) return null;

  const isKo = lang === "ko";

  const progress =
    totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

  const title = (() => {
    if (status === "compressing") {
      return isKo ? "이미지 압축 중..." : "Compressing images...";
    }
    if (status === "done" && !hasTimeoutError) {
      return isKo ? "이미지 압축 완료" : "Image compression completed";
    }
    if (status === "error" || hasTimeoutError) {
      return isKo ? "이미지 압축 중 오류 발생" : "Error during image compression";
    }
    return isKo ? "이미지 처리" : "Image processing";
  })();

  const description = (() => {
    if (status === "compressing") {
      return isKo
        ? "이미지를 최적화된 크기로 압축하고 있어요. 잠시만 기다려 주세요."
        : "We are compressing your images to an optimized size. Please wait a moment.";
    }
    if (status === "done" && !hasTimeoutError) {
      return isKo
        ? "이미지 압축이 완료되었습니다."
        : "Image compression has been completed.";
    }
    if (hasTimeoutError) {
      return isKo
        ? "일부 이미지 압축이 일정 시간 내에 완료되지 않았어요. 네트워크 상태를 확인한 뒤 다시 시도해 주세요."
        : "Some images could not be compressed within the time limit. Please check your network and try again.";
    }
    if (status === "error") {
      return isKo
        ? "이미지 압축 중 오류가 발생했습니다. 다시 시도해 주세요."
        : "An error occurred while compressing images. Please try again.";
    }
    return "";
  })();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-600 mb-4">{description}</p>

        {status === "compressing" && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>
                {isKo ? "진행률" : "Progress"}: {processedCount}/{totalCount}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full bg-black transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {(status === "done" || status === "error" || hasTimeoutError) && (
          <button
            type="button"
            onClick={onClose}
            className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {isKo ? "닫기" : "Close"}
          </button>
        )}

        {status === "compressing" && (
          <div className="mt-2 text-[11px] text-gray-400">
            {isKo
              ? "이미지 크기와 네트워크 상태에 따라 시간이 조금 걸릴 수 있어요."
              : "Processing time may vary depending on image size and network conditions."}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCompressionModal;
