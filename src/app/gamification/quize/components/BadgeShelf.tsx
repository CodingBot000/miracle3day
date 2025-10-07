'use client';
import { useEffect, useState } from 'react';

export default function BadgeShelf() {
  const [badges, setBadges] = useState<any>({ master: [], mine: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/gamification/quize/badges', { cache: 'no-store' });
        const result = await res.json();
        setBadges(result);
      } catch (error) {
        console.error('Failed to load badges:', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="h-48 rounded-2xl animate-pulse bg-gray-100" />;
  }

  if (!badges.master || !badges.mine) {
    return <div className="p-6 border rounded-2xl bg-white">배지 정보를 불러올 수 없습니다.</div>;
  }

  const mineMap = new Map(badges.mine.map((b: any) => [b.code, b.level]));

  return (
    <div className="p-6 border rounded-2xl bg-white shadow-sm">
      <h3 className="font-semibold text-lg mb-4">배지 컬렉션</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {badges.master.map((m: any) => {
          const lv = mineMap.get(m.code) ?? 0;
          const isUnlocked = lv > 0;

          return (
            <div
              key={m.code}
              className={`
                border-2 rounded-xl p-4 text-center transition-all
                ${isUnlocked ? 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-400' : 'bg-gray-50 border-gray-200'}
              `}
            >
              <div className={`text-3xl mb-2 ${!isUnlocked && 'grayscale opacity-50'}`}>
                {m.category === 'quiz' ? '🏆' : '⭐'}
              </div>
              <div className="text-sm font-medium mb-1">
                {m.name?.ko ?? m.code}
              </div>
              <div className="text-xs text-gray-600">
                Lv.{lv} / {m.max_level}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
