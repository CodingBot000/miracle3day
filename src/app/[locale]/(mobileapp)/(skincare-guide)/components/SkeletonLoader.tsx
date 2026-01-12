'use client';

interface SkeletonLoaderProps {
  type: 'card' | 'list' | 'text' | 'full';
}

export default function SkeletonLoader({ type }: SkeletonLoaderProps) {
  const baseClass = 'animate-pulse bg-gray-200 rounded';

  if (type === 'card') {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div className="flex items-center gap-3">
          <div className={`${baseClass} w-10 h-10 rounded-full`} />
          <div className="flex-1 space-y-2">
            <div className={`${baseClass} h-4 w-1/2`} />
            <div className={`${baseClass} h-3 w-1/3`} />
          </div>
        </div>
        <div className="space-y-3">
          <div className={`${baseClass} h-4 w-full`} />
          <div className={`${baseClass} h-4 w-4/5`} />
          <div className={`${baseClass} h-4 w-3/5`} />
        </div>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
            <div className={`${baseClass} w-6 h-6 rounded-full`} />
            <div className="flex-1 space-y-2">
              <div className={`${baseClass} h-3 w-3/4`} />
              <div className={`${baseClass} h-3 w-1/2`} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'text') {
    return (
      <div className="space-y-2">
        <div className={`${baseClass} h-4 w-full`} />
        <div className={`${baseClass} h-4 w-4/5`} />
        <div className={`${baseClass} h-4 w-3/5`} />
      </div>
    );
  }

  // Full page skeleton
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col max-w-md mx-auto p-5 space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`${baseClass} w-10 h-10 rounded-full`} />
        <div className="flex-1 space-y-2">
          <div className={`${baseClass} h-5 w-1/2`} />
          <div className={`${baseClass} h-4 w-1/3`} />
        </div>
      </div>

      {/* Condition card skeleton */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-4">
        <div className={`${baseClass} h-5 w-1/3`} />
        <div className="flex flex-wrap gap-2">
          <div className={`${baseClass} h-8 w-16 rounded-full`} />
          <div className={`${baseClass} h-8 w-20 rounded-full`} />
          <div className={`${baseClass} h-8 w-18 rounded-full`} />
        </div>
      </div>

      {/* Section skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <div className="flex items-center gap-3">
            <div className={`${baseClass} w-8 h-8 rounded-lg`} />
            <div className={`${baseClass} h-5 w-1/3`} />
          </div>
          <div className="space-y-2">
            <div className={`${baseClass} h-4 w-full`} />
            <div className={`${baseClass} h-4 w-4/5`} />
          </div>
        </div>
      ))}
    </div>
  );
}
