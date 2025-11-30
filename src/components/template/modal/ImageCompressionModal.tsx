// src/components/template/modal/ImageCompressionModal.tsx
"use client";

import React from "react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations('ImageCompression');
  const tCommon = useTranslations('Common');

  if (!open) return null;

  const progress =
    totalCount > 0 ? Math.round((processedCount / totalCount) * 100) : 0;

  const title = (() => {
    if (status === "compressing") {
      return t('compressing');
    }
    if (status === "done" && !hasTimeoutError) {
      return t('completed');
    }
    if (status === "error" || hasTimeoutError) {
      return t('error');
    }
    return t('processing');
  })();

  const description = (() => {
    if (status === "compressing") {
      return t('optimizing');
    }
    if (status === "done" && !hasTimeoutError) {
      return t('compressionDone');
    }
    if (hasTimeoutError) {
      return t('timeoutError');
    }
    if (status === "error") {
      return t('generalError');
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
                {tCommon('progress')}: {processedCount}/{totalCount}
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
            {tCommon('close')}
          </button>
        )}

        {status === "compressing" && (
          <div className="mt-2 text-[11px] text-gray-400">
            {t('processingNote')}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCompressionModal;
