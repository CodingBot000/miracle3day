"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackHeaderProps {
  title?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  className?: string;
}

export default function BackHeader({
  title,
  onBack,
  rightAction,
  className = "",
}: BackHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header className={`sticky top-0 z-10 bg-white border-b ${className}`}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left - Back Button */}
        <button
          onClick={handleBack}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Center - Title */}
        {title && (
          <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold">
            {title}
          </h1>
        )}

        {/* Right - Action */}
        <div className="min-w-[40px] flex justify-end">
          {rightAction}
        </div>
      </div>
    </header>
  );
}
