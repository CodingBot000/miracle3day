'use client';

import { useEffect, useState } from 'react';
import QuestionCard from './QuestionCard';
import { useLocale } from 'next-intl';
import { log } from '@/utils/logger';

export default function QuestionList({ topic, category, format, filter, isMainPage = false }: { topic?: string, category?: string, format?: string, filter?: string, isMainPage?: boolean }) {
  log.debug('=== QuestionList 렌더링됨 ===');
  log.debug('받은 filter prop:', filter);

  const locale = useLocale();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchQuestions = async (pageNum: number, append = false) => {
    log.debug('fetchQuestions 호출됨, filter:', filter);

    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const limit = isMainPage ? '1' : '10';
      const params = new URLSearchParams({
        lang: locale,
        page: pageNum.toString(),
        limit: limit
      });

      if (topic) params.append('topic', topic);
      if (category) params.append('category', category);
      if (format) params.append('format', format);
      if (filter) params.append('filter', filter);

      log.debug('=== API 요청 ===');
      log.debug('URL:', `/api/community/daily-questions?${params.toString()}`);

      const res = await fetch(
        `/api/community/daily-questions?${params.toString()}`,
        { cache: 'no-store' }
      );
      const data = await res.json();

      log.debug('=== API 응답 ===');
      log.debug('Status:', res.status);
      log.debug('Data:', data);
      log.debug('Questions 개수:', data.questions?.length);
      log.debug('Filter 적용됐는가?', data.questions?.map((q: any) => ({ id: q.id, tags: q.tags })));

      if (append) {
        setQuestions(prev => [...prev, ...(data.questions || [])]);
      } else {
        setQuestions(data.questions || []);
      }

      log.debug('=== State 업데이트 ===');
      log.debug('Questions State:', data.questions?.length, '개 저장됨');

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
    log.debug('=== QuestionList useEffect 실행됨 ===');
    log.debug('filter:', filter);
    log.debug('topic:', topic);
    log.debug('category:', category);
    log.debug('format:', format);
    log.debug('locale:', locale);
    log.debug('의존성 변경 감지됨! 새로운 데이터를 가져옵니다...');

    setPage(1);
    fetchQuestions(1, false);
  }, [topic, category, format, filter, locale]);

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
        <p className="text-xl font-semibold">{locale === 'ko' ? '오늘 질문이 없습니다' : 'No questions available today'}</p>
        <p className="text-sm mt-2">{locale === 'ko' ? '내일 다시 확인해주세요' : 'Check back tomorrow for new questions!'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((question: any) => (
        <QuestionCard key={question.id} question={question} />
      ))}

      {/* Load More 버튼 */}
      {hasMore && !isMainPage && (
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
                {locale === 'ko' ? '로딩 중...' : 'Loading...'}
              </>
            ) : (
              <>
                {locale === 'ko' ? '더 보기' : 'Load More'}
                <span className="text-xl">+</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 끝 표시 */}
      {!hasMore && questions.length > 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          {locale === 'ko' ? '모든 질문을 확인했습니다 ✓' : 'All questions loaded ✓'}
        </div>
      )}
    </div>
  );
}
