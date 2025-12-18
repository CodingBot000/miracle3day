'use client';

import { useState } from 'react';
import BucketSelector from './BucketSelector';
import BreadcrumbNav from './BreadcrumbNav';
import ColumnView from './ColumnView';
import PreviewPanel from './PreviewPanel';

export default function StorageExplorer() {
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<{
    key: string;
    name: string;
  } | null>(null);

  const handleBucketChange = (bucket: string) => {
    setSelectedBucket(bucket);
    setCurrentPath([]);
    setSelectedFile(null);
  };

  const handlePathChange = (path: string[]) => {
    setCurrentPath(path);
  };

  const handleFileSelect = (fileKey: string, fileName: string) => {
    setSelectedFile({ key: fileKey, name: fileName });
  };

  const handleBreadcrumbNavigate = (index: number) => {
    // index -1 = 버킷 루트
    // index 0+ = 해당 depth
    const newPath = index === -1 ? [] : currentPath.slice(0, index + 1);
    setCurrentPath(newPath);
    setSelectedFile(null);
    // ColumnView가 bucket/currentPath 변경을 감지하여 자동 리로드
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">
            Lightsail Storage Manager
          </h1>
          <BucketSelector
            selectedBucket={selectedBucket}
            onBucketChange={handleBucketChange}
          />
        </div>

        <BreadcrumbNav
          bucket={selectedBucket}
          path={currentPath}
          onNavigate={handleBreadcrumbNavigate}
        />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측: 컬럼 뷰 */}
        <div className="flex-1 p-4 overflow-hidden">
          <ColumnView
            bucket={selectedBucket}
            onPathChange={handlePathChange}
            onFileSelect={handleFileSelect}
          />
        </div>

        {/* 우측: 미리보기 */}
        <div className="w-96 border-l border-gray-200 bg-white">
          <PreviewPanel
            bucket={selectedBucket}
            fileKey={selectedFile?.key || null}
            fileName={selectedFile?.name || null}
          />
        </div>
      </div>
    </div>
  );
}
