'use client';

import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function CategoryNav({ categories }: { categories: any[] }) {
  const { language } = useCookieLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentView = searchParams.get('view') || 'posts';  // ← 현재 view 상태
  const currentTopic = searchParams.get('topic');  // ← topic 파라미터
  const currentTag = searchParams.get('tag');      // ← tag 파라미터

  const topicCategories = categories.filter(c => c.category_type === 'topic');
  const tagCategories = categories.filter(c => c.category_type === 'free');

  // URL 빌더 헬퍼 - view 상태 유지
  const buildUrl = (params: Record<string, string | undefined>) => {
    const urlParams = new URLSearchParams();

    // 현재 view 유지
    urlParams.set('view', currentView);

    // 전달받은 파라미터 추가
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });

    return `/community?${urlParams.toString()}`;
  };

  return (
    <nav className="space-y-6 mb-8">
      {/* Topics Section */}
      <div>
        <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">
          {language === 'ko' ? '🎯 주제별 커뮤니티' : '🎯 Topics'}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Link href={buildUrl({ tag: currentTag })}>
            <button className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
              !currentTopic
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
            }`}>
              {language === 'ko' ? '전체' : 'All'}
            </button>
          </Link>

          {topicCategories.map(cat => (
            <Link key={cat.id} href={buildUrl({ topic: cat.id, tag: currentTag })}>
              <button className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
                currentTopic === cat.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
              }`}>
                {cat.icon && `${cat.icon} `}{typeof cat.name === 'string' ? cat.name : cat.name[language]}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Tags Section */}
      {tagCategories.length > 0 && (
        <>
          <div className="border-t border-gray-200"></div>
          <div>
            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">
              {language === 'ko' ? '📋 태그' : '📋 Tags'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {tagCategories.map(cat => (
                <Link key={cat.id} href={buildUrl({ topic: currentTopic, tag: cat.id })}>
                  <button className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
                    currentTag === cat.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-blue-50 border border-gray-200'
                  }`}>
                    {cat.icon && `${cat.icon} `}{typeof cat.name === 'string' ? cat.name : cat.name[language]}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}