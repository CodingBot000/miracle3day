'use client';

import { useNavigation } from '@/hooks/useNavigation';

interface ChatHeaderProps {
  title: string;
  subtitle: string;
  showBackButton?: boolean;
}

export default function ChatHeader({
  title,
  subtitle,
  showBackButton = true,
}: ChatHeaderProps) {
  const { goBack } = useNavigation();

  return (
    <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-4 py-4 border-b border-gray-100">
      <div className="flex items-center justify-between">
        {showBackButton ? (
          <button
            onClick={goBack}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900 transition-colors"
            aria-label="Go back"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        ) : (
          <div className="w-10" />
        )}

        <div className="text-center flex-1">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        </div>

        <div className="w-10" />
      </div>
    </div>
  );
}
