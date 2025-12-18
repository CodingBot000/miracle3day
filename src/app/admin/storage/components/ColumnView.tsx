'use client';

import { useEffect, useState } from 'react';

interface Item {
  type: 'folder' | 'file';
  key: string;
  name: string;
  size?: number;
  lastModified?: string;
}

interface Column {
  prefix: string;
  items: Item[];
}

interface ColumnViewProps {
  bucket: string | null;
  onPathChange: (path: string[]) => void;
  onFileSelect: (fileKey: string, fileName: string) => void;
}

export default function ColumnView({
  bucket,
  onPathChange,
  onFileSelect,
}: ColumnViewProps) {
  const [columns, setColumns] = useState<Column[]>([]);
  const [selectedItems, setSelectedItems] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(false);

  // 버킷 변경 시 초기화
  useEffect(() => {
    if (bucket) {
      loadColumn('', 0);
    } else {
      setColumns([]);
      setSelectedItems(new Map());
    }
  }, [bucket]);

  const loadColumn = async (prefix: string, columnIndex: number) => {
    if (!bucket) return;

    try {
      setLoading(true);

      const params = new URLSearchParams({
        bucket,
        prefix,
      });

      const response = await fetch(`/api/admin/storage/list?${params}`);

      if (!response.ok) {
        throw new Error('Failed to list items');
      }

      const data = await response.json();
      const items: Item[] = [
        ...data.folders,
        ...data.files,
      ];

      // 해당 컬럼 및 이후 컬럼 교체
      setColumns((prev) => {
        const newColumns = prev.slice(0, columnIndex);
        newColumns.push({ prefix, items });
        return newColumns;
      });

      // 선택 상태 초기화 (해당 컬럼 이후)
      setSelectedItems((prev) => {
        const newMap = new Map(prev);
        for (let i = columnIndex; i < 10; i++) {
          newMap.delete(i);
        }
        return newMap;
      });

      // 경로 업데이트
      updatePath(columnIndex);
    } catch (err) {
      console.error('Error loading column:', err);
      alert('폴더 내용을 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleItemClick = (item: Item, columnIndex: number) => {
    // 선택 상태 업데이트
    setSelectedItems((prev) => {
      const newMap = new Map(prev);
      newMap.set(columnIndex, item.key);
      return newMap;
    });

    if (item.type === 'folder') {
      // 폴더: 다음 컬럼 로드
      loadColumn(item.key, columnIndex + 1);
    } else {
      // 파일: 미리보기
      onFileSelect(item.key, item.name);

      // 이후 컬럼 제거
      setColumns((prev) => prev.slice(0, columnIndex + 1));
    }
  };

  const updatePath = (columnIndex: number) => {
    const path: string[] = [];
    for (let i = 0; i < columnIndex; i++) {
      const selectedKey = selectedItems.get(i);
      if (selectedKey) {
        const column = columns[i];
        const item = column?.items.find((it) => it.key === selectedKey);
        if (item) {
          path.push(item.name);
        }
      }
    }
    onPathChange(path);
  };

  // UUID 폴더명 복사 함수
  const copyFolderNames = (columnIndex: number) => {
    const column = columns[columnIndex];
    if (!column) return;

    const folderNames = column.items
      .filter((item) => item.type === 'folder')
      .map((item) => `'${item.name}'`)
      .join(',\n');

    if (!folderNames) {
      alert('폴더가 없습니다.');
      return;
    }

    navigator.clipboard.writeText(folderNames);
    alert(`${column.items.filter((i) => i.type === 'folder').length}개 폴더명 복사 완료!`);
  };

  if (!bucket) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        버킷을 선택하세요
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-x-auto border border-gray-200 rounded-lg">
      {loading && columns.length === 0 && (
        <div className="flex items-center justify-center w-full">
          <div className="text-sm text-gray-500">로딩 중...</div>
        </div>
      )}

      {columns.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="flex-shrink-0 w-64 border-r border-gray-200 last:border-r-0 flex flex-col"
        >
          {/* 폴더명 복사 버튼 */}
          {column.items.some((item) => item.type === 'folder') && (
            <div className="p-2 border-b bg-gray-50">
              <button
                onClick={() => copyFolderNames(columnIndex)}
                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
              >
                📋 폴더명 복사
              </button>
            </div>
          )}

          {/* 항목 리스트 */}
          <div className="flex-1 overflow-y-auto">
            {column.items.map((item) => {
              const isSelected = selectedItems.get(columnIndex) === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => handleItemClick(item, columnIndex)}
                  className={`
                    w-full text-left px-3 py-2 text-sm hover:bg-blue-50
                    ${isSelected ? 'bg-blue-100 font-medium' : ''}
                    border-b border-gray-100 last:border-b-0
                  `}
                >
                  <div className="flex items-center gap-2">
                    <span>{item.type === 'folder' ? '📁' : '📄'}</span>
                    <span className="truncate">{item.name}</span>
                    {item.type === 'folder' && (
                      <span className="ml-auto text-gray-400">›</span>
                    )}
                  </div>
                </button>
              );
            })}

            {column.items.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-400">
                비어있음
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
