'use client';
import { useEffect, useState } from 'react';
import ProgressBar from './ProgressBar';

export default function DailyStats() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/gamification/quize/state', { cache: 'no-store' });
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="h-24 rounded-2xl animate-pulse bg-gray-100" />;
  }

  if (!data) {
    return <div className="p-4 border rounded-2xl bg-white">데이터를 불러올 수 없습니다.</div>;
  }

  const used = data.today?.count ?? 0;
  const quota = data.today?.quota ?? 5;
  const streakDays = data.streakDays ?? 0;

  return (
    <div className="p-6 border rounded-2xl bg-white shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-lg">오늘 시도: {used}/{quota}</div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-amber-600">🔥</span>
          <span className="text-gray-600">스트릭 {streakDays}일</span>
        </div>
      </div>
      <ProgressBar value={(used / quota) * 100} />
      <div className="mt-2 text-xs text-gray-500">
        {used >= quota ? '오늘 할당량 초과 시 20% 보상' : `${quota - used}번 더 풀면 일일 목표 달성!`}
      </div>
    </div>
  );
}
