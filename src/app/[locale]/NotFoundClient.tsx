"use client";

import { useEffect, useState, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import {
  Home,
  ArrowLeft,
  Search,
  AlertCircle,
  Building2,
  Sparkles,
  Info,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";
import { ROUTE } from "@/router";

export default function NotFoundClient() {
  // State
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const [timestamp, setTimestamp] = useState<string>('');
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Hooks
  const searchParams = useSearchParams();
  const t = useTranslations('NotFound');
  const { navigate, goBack } = useNavigation();

  // Custom message (backward compatible)
  const customMessage = searchParams.get("message");

  // Effects
  useEffect(() => {
    setCurrentUrl(window.location.pathname);
    setTimestamp(format(new Date(), 'PPpp'));
  }, []);

  // Handlers
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/hospital?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleReportLink = () => {
    const subject = encodeURIComponent('Broken Link Report');
    const body = encodeURIComponent(
      `I found a broken link:\n\nURL: ${currentUrl}\nTime: ${timestamp}\n\nDetails: `
    );
    window.location.href = `mailto:mimotok.official@gmail.com?subject=${subject}&body=${body}`;
  };

  const navigateToPage = (path: string) => {
    navigate(path);
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 md:px-8 md:py-12 bg-gray-50">
      <div className="max-w-2xl w-full mx-auto text-center space-y-6 md:space-y-8">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="bg-red-100 rounded-full p-6">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
        </div>

        {/* Error Code */}
        <div className="text-7xl md:text-9xl font-bold text-gray-300">
          404
        </div>

        {/* Title */}
        <h1 className="text-2xl md:text-4xl font-bold text-gray-900">
          {customMessage || t('title')}
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-gray-600">
          {t('subtitle')}
        </p>

        {/* Error Details (Collapsible) */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            aria-expanded={showDetails}
          >
            <span className="text-sm font-medium text-gray-700">
              {showDetails ? t('hideDetails') : t('showDetails')}
            </span>
            {showDetails ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>

          {showDetails && (
            <div className="px-4 py-3 bg-gray-50 text-left text-sm text-gray-600 space-y-2 border-t border-gray-200">
              <p><strong>{t('errorCode')}:</strong> 404</p>
              <p><strong>{t('currentUrl')}:</strong> {currentUrl}</p>
              <p><strong>{t('timestamp')}:</strong> {timestamp}</p>
            </div>
          )}
        </div>

        {/* Reasons Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 text-left space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Info className="w-5 h-5 text-blue-500" />
            {t('reasonsTitle')}
          </h2>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>{t('reason1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>{t('reason2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>{t('reason3')}</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigateToPage(ROUTE.HOME)}
            className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            aria-label={t('goHome')}
          >
            <Home className="w-5 h-5" />
            {t('goHome')}
          </button>

          <button
            onClick={goBack}
            className="flex items-center justify-center gap-2 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg transition-colors font-medium"
            aria-label={t('goBack')}
          >
            <ArrowLeft className="w-5 h-5" />
            {t('goBack')}
          </button>
        </div>

        {/* Search Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
              aria-label={t('searchPlaceholder')}
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Popular Pages */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t('suggestionsTitle')}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Home */}
            <button
              onClick={() => navigateToPage(ROUTE.HOME)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex flex-col items-center gap-2">
                <Home className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">
                  {t('goHome')}
                </span>
              </div>
            </button>

            {/* Hospitals */}
            <button
              onClick={() => navigateToPage(ROUTE.HOSPITAL)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex flex-col items-center gap-2">
                <Building2 className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">
                  {t('hospitals')}
                </span>
              </div>
            </button>

            {/* Treatments */}
            <button
              onClick={() => navigateToPage(ROUTE.TREATMENT_PROTOCOL)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex flex-col items-center gap-2">
                <Sparkles className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">
                  {t('treatments')}
                </span>
              </div>
            </button>

            {/* About Us */}
            <button
              onClick={() => navigateToPage(ROUTE.ABOUTUS)}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all group"
            >
              <div className="flex flex-col items-center gap-2">
                <Info className="w-8 h-8 text-blue-500 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-gray-700">
                  {t('aboutUs')}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Report Broken Link */}
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleReportLink}
            className="text-sm text-gray-500 hover:text-blue-500 transition-colors underline"
          >
            {t('reportLink')}
          </button>
        </div>
      </div>
    </main>
  );
}
