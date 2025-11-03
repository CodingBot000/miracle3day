'use client';

import { useEffect, useState } from 'react';
import QuestionCard from './QuestionCard';
import { useCookieLanguage } from '@/hooks/useCookieLanguage';

export default function QuestionList({ category, format }: { category?: string, format?: string }) {
  const { language } = useCookieLanguage();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          date: 'all',
          lang: language
        });

        if (category) params.append('category', category);
        if (format) params.append('format', format);

        const res = await fetch(
          `/api/community/daily-questions?${params.toString()}`,
          { cache: 'no-store' }
        );
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [category, format, language]);

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
    </div>
  );
}
