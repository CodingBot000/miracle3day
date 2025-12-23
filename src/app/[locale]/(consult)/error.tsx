"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  AlertCircle,
  Home,
  ArrowLeft,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Mail,
  Bug
} from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";
import { ROUTE } from "@/router";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [timestamp, setTimestamp] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);

  const t = useTranslations('Error');
  const { navigate, goBack } = useNavigation();

  useEffect(() => {
    // Log error to console for debugging
    console.error('[Error Boundary]', error);

    // Set timestamp
    setTimestamp(format(new Date(), 'yyyy-MM-dd HH:mm:ss'));
  }, [error]);

  const handleReportIssue = () => {
    const subject = encodeURIComponent(`Error Report: ${error.name || 'Application Error'}`);
    const body = encodeURIComponent(`
Error Type: ${error.name || 'Unknown'}
Error Message: ${error.message}
Error Digest: ${error.digest || 'N/A'}
Timestamp: ${timestamp}
User Agent: ${navigator.userAgent}

Please describe what you were doing when this error occurred:
[Your description here]
    `.trim());

    window.location.href = `mailto:support@example.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-6 md:p-8">
        {/* Header with Icon */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {/* Error Information Card */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                {t('errorType')}:
              </span>
              <span className="text-gray-900 break-all">
                {error.name || 'Error'}
              </span>
            </div>
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                {t('errorMessage')}:
              </span>
              <span className="text-gray-900 break-all">
                {error.message || 'An unexpected error occurred'}
              </span>
            </div>
            {error.digest && (
              <div className="flex items-start">
                <span className="font-semibold text-gray-700 min-w-[120px]">
                  {t('errorDigest')}:
                </span>
                <span className="text-gray-900 font-mono text-sm break-all">
                  {error.digest}
                </span>
              </div>
            )}
            <div className="flex items-start">
              <span className="font-semibold text-gray-700 min-w-[120px]">
                {t('timestamp')}:
              </span>
              <span className="text-gray-900">
                {timestamp}
              </span>
            </div>
          </div>
        </div>

        {/* Collapsible Technical Details */}
        {error.stack && (
          <div className="mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center justify-between w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              aria-expanded={showDetails}
            >
              <span className="flex items-center gap-2 font-semibold text-gray-700">
                <Bug className="w-5 h-5" />
                {showDetails ? t('hideDetails') : t('showDetails')}
              </span>
              {showDetails ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {showDetails && (
              <div className="mt-2 p-4 bg-gray-900 text-gray-100 rounded-lg overflow-auto max-h-80">
                <div className="text-xs font-semibold mb-2 text-gray-400">
                  {t('stackTrace')}:
                </div>
                <pre className="text-xs font-mono whitespace-pre-wrap break-all">
                  {error.stack}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* Explanation Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            {t('whatHappened')}
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {t('errorExplanation')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">
            {t('whatCanYouDo')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => reset()}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium"
            >
              <RotateCcw className="w-5 h-5" />
              {t('tryAgain')}
            </button>

            <button
              onClick={() => navigate(ROUTE.HOME)}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200 font-medium"
            >
              <Home className="w-5 h-5" />
              {t('goHome')}
            </button>

            <button
              onClick={() => goBack()}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors duration-200 font-medium"
            >
              <ArrowLeft className="w-5 h-5" />
              {t('goBack')}
            </button>
          </div>
        </div>

        {/* Report Issue */}
        <div className="border-t pt-4">
          <button
            onClick={handleReportIssue}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium">{t('reportIssue')}</span>
          </button>
          <p className="text-sm text-gray-500 text-center mt-2">
            {t('reportEmail')}
          </p>
        </div>
      </div>
    </div>
  );
}
