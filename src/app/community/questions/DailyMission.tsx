'use client';

import { useEffect, useState } from 'react';

export default function DailyMission() {
  const [progress, setProgress] = useState(0);
  const maxAnswers = 3;

  useEffect(() => {
    // TODO: 실제 API 호출로 오늘의 답변 수 조회
    // 현재는 0으로 시작
    setProgress(0);
  }, []);

  return (
    <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl p-6 mb-6 shadow-lg">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="text-2xl font-bold mb-2">🎯 Today&apos;s Mission</h3>
          <p className="opacity-90">Answer 3 questions and earn 150 points!</p>
        </div>
        <div className="flex gap-3">
          {[...Array(maxAnswers)].map((_, i) => (
            <div
              key={i}
              className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold transition ${
                i < progress
                  ? 'bg-white text-pink-600'
                  : 'bg-white/30 text-white'
              }`}
            >
              {i < progress ? '✓' : i + 1}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
