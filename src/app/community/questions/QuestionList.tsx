'use client';

import { useEffect, useState } from 'react';
import QuestionCard from './QuestionCard';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';

export default function QuestionList({ category, format }: { category?: string, format?: string }) {
  const { language } = useCookieLanguage();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchQuestions = async (pageNum: number, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const params = new URLSearchParams({
        date: 'all',
        lang: language,
        page: pageNum.toString(),
        limit: '10'
      });

      if (category) params.append('category', category);
      if (format) params.append('format', format);

      const res = await fetch(
        `/api/community/daily-questions?${params.toString()}`,
        { cache: 'no-store' }
      );
      const data = await res.json();

      if (append) {
        setQuestions(prev => [...prev, ...(data.questions || [])]);
      } else {
        setQuestions(data.questions || []);
      }

      setHasMore(data.pagination?.hasMore || false);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      if (!append) setQuestions([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchQuestions(1, false);
  }, [category, format, language]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchQuestions(nextPage, true);
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-xl"></div>;
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 bg-white rounded-xl">
        <div className="text-6xl mb-4">🤔</div>
        <p className="text-xl font-semibold">No questions available today</p>
        <p className="text-sm mt-2">Check back tomorrow for new questions!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question: any) => (
        <QuestionCard key={question.id} question={question} />
      ))}

      {/* Load More 버튼 */}
      {hasMore && (
        <div className="flex justify-center py-6">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="px-8 py-3 bg-pink-600 text-white rounded-lg font-semibold hover:bg-pink-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            {loadingMore ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {language === 'ko' ? '로딩 중...' : 'Loading...'}
              </>
            ) : (
              <>
                {language === 'ko' ? '더 보기' : 'Load More'}
                <span className="text-xl">+</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 끝 표시 */}
      {!hasMore && questions.length > 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          {language === 'ko' ? '모든 질문을 확인했습니다 ✓' : 'All questions loaded ✓'}
        </div>
      )}
    </div>
  );
}
