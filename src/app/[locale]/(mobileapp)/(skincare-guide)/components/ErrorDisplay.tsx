'use client';

interface ErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  locale?: string;
}

export default function ErrorDisplay({ error, onRetry, locale = 'ko' }: ErrorDisplayProps) {
  const texts = {
    ko: {
      title: '오류가 발생했습니다',
      retry: '다시 시도',
      goBack: '뒤로 가기',
    },
    en: {
      title: 'An error occurred',
      retry: 'Retry',
      goBack: 'Go Back',
    },
  };

  const t = texts[locale === 'ko' ? 'ko' : 'en'];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{t.title}</h2>
        <p className="text-gray-600 mb-6 text-sm">{error}</p>
        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              {t.retry}
            </button>
          )}
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            {t.goBack}
          </button>
        </div>
      </div>
    </div>
  );
}
