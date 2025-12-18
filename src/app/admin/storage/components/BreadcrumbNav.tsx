'use client';

interface BreadcrumbNavProps {
  bucket: string | null;
  path: string[];
  onNavigate: (index: number) => void;
}

export default function BreadcrumbNav({
  bucket,
  path,
  onNavigate,
}: BreadcrumbNavProps) {
  if (!bucket) return null;

  return (
    <div className="flex items-center gap-1 text-sm text-gray-600 overflow-x-auto py-2">
      {/* 버킷명 */}
      <button
        onClick={() => onNavigate(-1)}
        className="hover:text-blue-600 hover:underline font-medium"
      >
        📦 {bucket}
      </button>

      {/* 경로 */}
      {path.map((segment, index) => (
        <div key={index} className="flex items-center gap-1">
          <span className="text-gray-400">/</span>
          <button
            onClick={() => onNavigate(index)}
            className="hover:text-blue-600 hover:underline"
          >
            {segment}
          </button>
        </div>
      ))}
    </div>
  );
}
