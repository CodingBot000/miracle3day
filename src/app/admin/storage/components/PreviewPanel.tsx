'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface PreviewPanelProps {
  bucket: string | null;
  fileKey: string | null;
  fileName: string | null;
}

export default function PreviewPanel({
  bucket,
  fileKey,
  fileName,
}: PreviewPanelProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bucket || !fileKey) {
      setPreviewUrl(null);
      return;
    }

    // 이미지 파일인지 확인
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const isImage = imageExtensions.some((ext) =>
      fileKey.toLowerCase().endsWith(ext)
    );

    if (!isImage) {
      setPreviewUrl(null);
      return;
    }

    fetchPresignedUrl();
  }, [bucket, fileKey]);

  const fetchPresignedUrl = async () => {
    if (!bucket || !fileKey) return;

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        bucket,
        key: fileKey,
      });

      const response = await fetch(`/api/admin/storage/presign?${params}`);

      if (!response.ok) {
        throw new Error('Failed to generate preview URL');
      }

      const data = await response.json();
      setPreviewUrl(data.url);
    } catch (err) {
      console.error('Error fetching presigned URL:', err);
      setError('미리보기를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!fileKey) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        파일을 선택하세요
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-red-500">{error}</div>
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 text-sm">
        <div>📄 {fileName}</div>
        <div className="mt-2 text-xs text-gray-400">미리보기 불가</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-2 border-b text-sm font-medium text-gray-700 truncate">
        {fileName}
      </div>
      <div className="flex-1 relative overflow-auto p-4 bg-gray-50">
        <Image
          src={previewUrl}
          alt={fileName || 'Preview'}
          width={800}
          height={800}
          className="max-w-full h-auto mx-auto"
          unoptimized
        />
      </div>
    </div>
  );
}
