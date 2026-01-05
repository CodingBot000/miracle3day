'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useNavigation } from '@/hooks/useNavigation';
import {
  getPersonalizedGuide,
  getTranslation,
  PersonalizedGuide,
  Article,
  Guideline,
} from '../../lib/getPersonalizedGuide';
import { UserCondition, AGE_LABELS, SKIN_TYPE_LABELS, CONCERN_LABELS } from '../../lib/types';

// Import i18n data
import koTranslations from '../../i18n/ko.json';
import enTranslations from '../../i18n/en.json';

export default function SkincareGuideResultPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const { navigate, goBack } = useNavigation();
  const locale = (params?.locale as string) || 'ko';

  const [guide, setGuide] = useState<PersonalizedGuide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('age');

  // Get translations
  const translations = locale === 'ko' ? koTranslations : enTranslations;
  const lang = locale === 'ko' ? 'ko' : 'en';

  // Parse user condition from URL params
  const condition: UserCondition = useMemo(() => ({
    ageGroup: searchParams.get('age') || '20s',
    skinType: searchParams.get('skin') || 'normal',
    concerns: searchParams.get('concerns')?.split(',').filter(Boolean) || [],
  }), [searchParams]);

  // Load personalized guide
  useEffect(() => {
    setIsLoading(true);

    // Simulate loading for smooth UX
    const timer = setTimeout(() => {
      const personalizedGuide = getPersonalizedGuide(condition);
      setGuide(personalizedGuide);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [condition]);

  // Helper to get translated text
  const t = (key: string): string => {
    return getTranslation(translations as Record<string, unknown>, key);
  };

  // Get label for display
  const getAgeLabel = () => AGE_LABELS[condition.ageGroup]?.[lang] || condition.ageGroup;
  const getSkinLabel = () => SKIN_TYPE_LABELS[condition.skinType]?.[lang] || condition.skinType;
  const getConcernLabels = () =>
    condition.concerns.map((c) => CONCERN_LABELS[c]?.[lang] || c).join(', ');

  const texts = {
    ko: {
      title: '맞춤 스킨케어 가이드',
      yourCondition: '나의 피부 조건',
      ageSpecific: '연령대별 케어 가이드',
      guidelines: '나에게 맞는 팁',
      quickTips: '기본 스킨케어 팁',
      articles: '추천 아티클',
      askAI: 'AI에게 질문하기',
      noResults: '조건에 맞는 가이드를 찾을 수 없습니다.',
      loading: '맞춤 가이드를 준비 중...',
      source: '출처',
      readMore: '더 보기',
      collapse: '접기',
      backToCondition: '조건 변경하기',
    },
    en: {
      title: 'Personalized Skincare Guide',
      yourCondition: 'Your Skin Condition',
      ageSpecific: 'Age-Specific Care Guide',
      guidelines: 'Tips for You',
      quickTips: 'Basic Skincare Tips',
      articles: 'Recommended Articles',
      askAI: 'Ask AI',
      noResults: 'No guides found for your condition.',
      loading: 'Preparing your guide...',
      source: 'Source',
      readMore: 'Read More',
      collapse: 'Collapse',
      backToCondition: 'Change Condition',
    },
  };

  const ui = texts[lang];

  // Navigate to chat
  const handleAskAI = () => {
    const params = new URLSearchParams({
      age: condition.ageGroup,
      skin: condition.skinType,
      concerns: condition.concerns.join(','),
    });
    navigate(`/skincare-guide/chat?${params.toString()}`);
  };

  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Render age-specific article
  const renderAgeArticle = (article: Article) => {
    const articleKey = `article.${article.id.replace(/-/g, '')}`;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('age')}
          className="w-full px-5 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {condition.ageGroup === '20s' || condition.ageGroup === '30s' ? '🌱' :
               condition.ageGroup === '40s-50s' ? '🌿' : '🌳'}
            </span>
            <div className="text-left">
              <h3 className="font-bold text-gray-900">{ui.ageSpecific}</h3>
              <p className="text-sm text-gray-600">{getAgeLabel()}</p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === 'age' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSection === 'age' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-5 py-4 space-y-4"
          >
            {/* Key Messages */}
            {article.keyMessages?.map((message, idx) => (
              <div key={idx} className="border-l-3 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900 mb-1">
                  {t(`${articleKey}.message${idx + 1}.title`)}
                </h4>
                <p className="text-sm text-gray-600">
                  {t(`${articleKey}.message${idx + 1}.content`)}
                </p>
              </div>
            ))}

            {/* Essential Products */}
            {article.essentialProducts && article.essentialProducts.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-gray-900 mb-3">
                  {locale === 'ko' ? '필수 제품' : 'Essential Products'}
                </h4>
                <div className="grid grid-cols-2 gap-2">
                  {article.essentialProducts.map((product, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm font-medium text-gray-900 capitalize">
                        {product.type.replace('-', ' ')}
                      </div>
                      <div className="text-xs text-gray-500">{product.frequency}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expert Quote */}
            {article.expertQuotes?.[0] && (
              <div className="mt-4 p-4 bg-blue-50 rounded-xl">
                <p className="text-sm text-blue-800 italic">
                  "{article.expertQuotes[0].quote}"
                </p>
                <p className="text-xs text-blue-600 mt-2">
                  — {article.expertQuotes[0].author}
                </p>
              </div>
            )}

            {/* Source */}
            {article.source && (
              <div className="text-xs text-gray-400 mt-4">
                {ui.source}: {article.source.name}
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  };

  // Render guidelines
  const renderGuidelines = (guidelines: Guideline[], title: string, icon: string, sectionKey: string) => {
    if (guidelines.length === 0) return null;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full px-5 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <h3 className="font-bold text-gray-900">{title}</h3>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === sectionKey ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSection === sectionKey && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-5 pb-4 space-y-3"
          >
            {guidelines.map((guideline, idx) => (
              <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    {t(guideline.title_key)}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1">
                    {t(guideline.content_key)}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  // Render recommended articles
  const renderArticles = (articles: Article[]) => {
    if (articles.length === 0) return null;

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('articles')}
          className="w-full px-5 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <h3 className="font-bold text-gray-900">{ui.articles}</h3>
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${expandedSection === 'articles' ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {expandedSection === 'articles' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-5 pb-4 space-y-3"
          >
            {articles.map((article, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-xl">
                <h4 className="font-medium text-gray-900">
                  {t(article.title_key || '')}
                </h4>
                <p className="text-sm text-gray-600 mt-1">
                  {t(article.summary_key || '')}
                </p>
                {article.tags && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center max-w-md mx-auto">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{ui.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-gray-900">{ui.title}</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-5 py-6 pb-32 space-y-4">
        {/* User Condition Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
        >
          <h2 className="text-sm font-medium text-gray-500 mb-3">{ui.yourCondition}</h2>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-blue-200 text-black rounded-full text-sm font-medium">
              {getAgeLabel()}
            </span>
            <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {getSkinLabel()}
            </span>
            {condition.concerns.slice(0, 3).map((concern, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 bg-green-200 text-black rounded-full text-sm font-medium"
              >
                {CONCERN_LABELS[concern]?.[lang] || concern}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Age-specific Article */}
        {guide?.ageArticle && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {renderAgeArticle(guide.ageArticle)}
          </motion.div>
        )}

        {/* Personalized Guidelines */}
        {guide?.guidelines && guide.guidelines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {renderGuidelines(guide.guidelines, ui.guidelines, '💡', 'guidelines')}
          </motion.div>
        )}

        {/* Quick Tips */}
        {guide?.quickTips && guide.quickTips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {renderGuidelines(guide.quickTips, ui.quickTips, '✨', 'tips')}
          </motion.div>
        )}

        {/* Recommended Articles */}
        {guide?.relevantArticles && guide.relevantArticles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {renderArticles(guide.relevantArticles)}
          </motion.div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 p-4 shadow-lg z-50">
        <div className="flex gap-3">
          <button
            onClick={goBack}
            className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            {ui.backToCondition}
          </button>
          <button
            onClick={handleAskAI}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {ui.askAI}
          </button>
        </div>
      </div>
    </div>
  );
}
