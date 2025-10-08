'use client';
import { useState } from 'react';
import QuizPanel from './components/QuizPanel';
import DailyStats from './components/DailyStats';
import BadgeShelf from './components/BadgeShelf';

export default function QuizPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAnswerSubmit = () => {
    // DailyStats를 새로고침하도록 트리거
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">뷰티 지식 퀴즈</h1>
          <p className="text-gray-600">매일 퀴즈를 풀고 EXP와 배지를 모아보세요!</p>
        </div>

        <DailyStats refreshTrigger={refreshTrigger} />
        <QuizPanel onAnswerSubmit={handleAnswerSubmit} />
        <BadgeShelf />
      </div>
    </div>
  );
}
