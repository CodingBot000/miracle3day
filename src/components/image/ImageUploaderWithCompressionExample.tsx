// src/components/image/ImageUploaderWithCompressionExample.tsx
"use client";

import React, { useState } from "react";
import {
  compressSingleImage,
  compressMultipleImages,
  ImageCompressionType,
  ImageCompressionError,
  ImageCompressionTimeoutError,
} from "@/utils/imageCompression";
import ImageCompressionModal, {
  ImageCompressionModalStatus,
} from "@/components/template/modal/ImageCompressionModal";

type ExampleMode = "single" | "multiple";

const ImageUploaderWithCompressionExample: React.FC = () => {
  const [mode, setMode] = useState<ExampleMode>("single");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] =
    useState<ImageCompressionModalStatus>("idle");
  const [totalCount, setTotalCount] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [hasTimeoutError, setHasTimeoutError] = useState(false);
  const [type, setType] = useState<ImageCompressionType>("profile");

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const targetType = type;

    setTotalCount(fileArray.length);
    setProcessedCount(0);
    setHasTimeoutError(false);
    setModalStatus("compressing");
    setModalOpen(true);

    try {
      if (fileArray.length === 1) {
        // 단일 파일
        const result = await compressSingleImage(fileArray[0], targetType);
        setProcessedCount(1);
        console.log("compressed single result", result);
      } else {
        // 다중 파일
        const { results, errors } = await compressMultipleImages(
          fileArray,
          targetType
        );

        setProcessedCount(fileArray.length);

        if (errors.length > 0) {
          const hasTimeout = errors.some(
            (e) => e instanceof ImageCompressionTimeoutError
          );
          setHasTimeoutError(hasTimeout);
          setModalStatus("error");
          console.error("compression errors", errors);
        } else {
          setModalStatus("done");
        }

        console.log("compressed multiple results", results);
      }

      if (fileArray.length === 1) {
        setModalStatus("done");
      }
    } catch (error) {
      console.error(error);

      if (error instanceof ImageCompressionTimeoutError) {
        setHasTimeoutError(true);
      }

      setModalStatus("error");
    }
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    handleFiles(files);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setModalStatus("idle");
    setTotalCount(0);
    setProcessedCount(0);
    setHasTimeoutError(false);
  };

  return (
    <div className="space-y-4">
      {/* 타입 선택 */}
      <div className="flex gap-2 text-sm">
        <label className="flex items-center gap-1">
          <span>Type:</span>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ImageCompressionType)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="profile">profile</option>
            <option value="review">review</option>
            <option value="community_posting">community_posting</option>
            <option value="thumbnail">thumbnail</option>
            <option value="clinic_display">clinic_display</option>
            <option value="doctor">doctor</option>
          </select>
        </label>

        <label className="flex items-center gap-1">
          <span>Mode:</span>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as ExampleMode)}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value="single">single</option>
            <option value="multiple">multiple</option>
          </select>
        </label>
      </div>

      {/* 파일 인풋 */}
      <div>
        <input
          type="file"
          accept="image/*"
          multiple={mode === "multiple"}
          onChange={handleFileInputChange}
        />
      </div>

      {/* 압축 모달 */}
      <ImageCompressionModal
        open={modalOpen}
        totalCount={totalCount}
        processedCount={processedCount}
        status={modalStatus}
        hasTimeoutError={hasTimeoutError}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ImageUploaderWithCompressionExample;
