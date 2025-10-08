'use client';
import { useEffect, useState } from 'react';
import AnswerButton from './AnswerButton';
import { useRouter } from 'next/navigation';

type Question = {
  id: string;
  stem: string;
  options: string[];
  answerIndex: number;
};

export default function QuizPanel({ onAnswerSubmit }: { onAnswerSubmit?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [expEarned, setExpEarned] = useState<number>(0);
  const [todayCount, setTodayCount] = useState<number>(0);
  const [showCompletion, setShowCompletion] = useState(false);

  async function loadState() {
    try {
      const res = await fetch('/api/gamification/quize/state', { cache: 'no-store' });
      const data = await res.json();
      setQ(data.question);
      setTodayCount(data.today?.count || 0);

      // 5문제 완료 시 완료 화면 표시
      if (data.today?.count >= 5 && !showCompletion) {
        setShowCompletion(true);
      }
    } catch (error) {
      console.error('Failed to load question:', error);
    }
  }

  useEffect(() => {
    loadState();
  }, []);

  async function onAnswer(index: number) {
    if (!q || isAnswered) return;

    setSelectedIndex(index);
    setLoading(true);

    try {
      const res = await fetch('/api/gamification/quize/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId: q.id, optionIndex: index })
      });

      const data = await res.json();
      const correct = index === q.answerIndex;

      setIsCorrect(correct);
      setIsAnswered(true);
      setExpEarned(data.expEarned || 0);
      setTodayCount(data.totalToday || 0);

      // DailyStats 업데이트 트리거
      if (onAnswerSubmit) {
        onAnswerSubmit();
      }

      // 5문제 완료 체크
      if (data.totalToday >= 5) {
        setTimeout(() => {
          setShowCompletion(true);
        }, 2000);
        return;
      }

      // Auto-load next question after 3 seconds
      setTimeout(() => {
        setQ(data.nextQuestion);
        setSelectedIndex(null);
        setIsAnswered(false);
        setIsCorrect(null);
        setExpEarned(0);
      }, 3000);
    } catch (error) {
      console.error('Failed to submit answer:', error);
    } finally {
      setLoading(false);
    }
  }

  // 5문제 완료 화면
  if (showCompletion) {
    return (
      <div className="p-6 border rounded-2xl bg-white shadow-sm">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold mb-2">나이스!</h3>
          <p className="text-lg mb-6">오늘의 문제를 모두 푸셨습니다! 내일 또 뵈요!</p>

          <div className="flex gap-3 justify-center mb-4">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-colors"
            >
              그만하기
            </button>
            <button
              onClick={() => {
                setShowCompletion(false);
                loadState();
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-lg font-semibold transition-all"
            >
              문제 더 풀기
            </button>
          </div>

          <p className="text-sm text-gray-500">5문제 이후부터는 경험치가 줄어들어요</p>
        </div>
      </div>
    );
  }

  if (!q) {
    return (
      <div className="p-6 border rounded-2xl bg-white shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
            <div className="h-10 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-2xl bg-white shadow-sm">
      <h2 className="text-xl font-semibold mb-4">오늘의 뷰티 퀴즈</h2>

      <div className="mb-6">
        <p className="text-lg mb-4 leading-relaxed">{q.stem}</p>

        <div className="grid gap-3">
          {q.options.map((opt: string, idx: number) => {
            let state: 'default' | 'correct' | 'wrong' = 'default';

            if (isAnswered) {
              if (idx === q.answerIndex) {
                state = 'correct';
              } else if (idx === selectedIndex) {
                state = 'wrong';
              }
            }

            return (
              <AnswerButton
                key={idx}
                label={opt}
                disabled={loading || isAnswered}
                onClick={() => onAnswer(idx)}
                state={state}
              />
            );
          })}
        </div>
      </div>

      {isAnswered && (
        <div className={`p-4 rounded-xl text-sm ${isCorrect ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          {isCorrect ? (
            <div>
              <div className="font-semibold mb-1">✓ 정답입니다!</div>
              <div>EXP +{expEarned}가 적립되었습니다.</div>
            </div>
          ) : (
            <div>
              <div className="font-semibold mb-1">✗ 아쉽네요!</div>
              <div>그래도 시도 EXP +{expEarned}가 적립되었습니다.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
