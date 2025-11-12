'use client';

import { AlertCircle, RefreshCw } from 'lucide-react';

interface BadgeErrorFallbackProps {
  error: string;
  onRetry: () => void;
  canRetry: boolean;
  retryCount: number;
}

export default function BadgeErrorFallback({
  error,
  onRetry,
  canRetry,
  retryCount,
}: BadgeErrorFallbackProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-8 text-center">
      {/* 아이콘 */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
      </div>

      {/* 타이틀 */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Unable to Load Badges
      </h3>

      {/* 에러 메시지 */}
      <p className="text-sm text-gray-600 mb-6">
        {canRetry
          ? 'We encountered an issue loading your badges. Please try again.'
          : 'Please refresh the page or contact support if the problem persists.'}
      </p>

      {/* 디버그 정보 (개발 환경에서만) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-700 font-mono break-all">
            {error}
          </p>
        </div>
      )}

      {/* Retry 버튼 */}
      {canRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-semibold rounded-lg hover:from-pink-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry {retryCount > 0 && `(${retryCount}/3)`}</span>
        </button>
      )}

      {/* 최대 재시도 도달 */}
      {!canRetry && (
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Page</span>
        </button>
      )}
    </div>
  );
}
