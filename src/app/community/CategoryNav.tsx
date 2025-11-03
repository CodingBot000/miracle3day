'use client';

import { useCookieLanguage } from '@/hooks/useCookieLanguage';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';

export default function CategoryNav({ categories }: { categories: any[] }) {
  const { language } = useCookieLanguage();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const freeCategoryParam = searchParams.get('category'); // 자유 게시판용
  const currentCategory = searchParams.get('category'); // 주제별 질문용
  const currentFormat = searchParams.get('format'); // 형식별 질문용

  // 디버깅: 전체 카테고리 확인
  console.log('[CategoryNav] 전체 categories:', JSON.stringify(categories, null, 2));
  console.log('[CategoryNav] categories 개수:', categories.length);

  // DB에서 필터링
  const freeCategories = categories.filter(c =>
    !c.category_type || c.category_type === 'free'
  );

  // Question-driven categories를 topic과 format으로 구분
  const questionDrivenCategories = categories.filter(c =>
    c.category_type === 'question-driven'
  );

  // order_index로 구분: 1-9는 topic, 10 이상은 format
  const topicCategories = questionDrivenCategories.filter(c => c.order_index < 10);
  const formatCategories = questionDrivenCategories.filter(c => c.order_index >= 10);

  console.log('[CategoryNav] topicCategories:', topicCategories.map(c => ({ id: c.id, name: c.name, order: c.order_index })));
  console.log('[CategoryNav] formatCategories:', formatCategories.map(c => ({ id: c.id, name: c.name, order: c.order_index })));

  return (
    <nav className="space-y-6 mb-8">
      {/* Question-Driven Section - Topics */}
      <div>
        <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">
          {language === 'ko' ? '🎯 주제별 질문' : '🎯 Topic-Driven Questions'}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/community/questions">
            <button className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
              pathname === '/community/questions' && !currentCategory && !currentFormat
                ? 'text-black shadow-lg border-2 border-purple-800'
                : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
            }`}>
              {language === 'ko' ? '전체 질문' : 'All Questions'}
            </button>
          </Link>

          {topicCategories.map(cat => (
            <Link key={cat.id} href={`/community/questions?category=${cat.id}`}>
              <button className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
                pathname === '/community/questions' && currentCategory === cat.id
                  ? 'text-black shadow-lg border-2 border-purple-800'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
              }`}>
                {cat.name}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* Question-Driven Section - Formats */}
      <div>
        <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">
          {language === 'ko' ? '📋 형식별 질문' : '📋 Format-Driven Questions'}
        </h3>
        <div className="flex flex-wrap gap-2">
          {formatCategories.map(cat => (
            <Link key={cat.id} href={`/community/questions?format=${cat.id}`}>
              <button className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
                pathname === '/community/questions' && currentFormat === cat.id
                  ? 'text-black shadow-lg border-2 border-purple-800'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
              }`}>
                {cat.name}
              </button>
            </Link>
          ))}
        </div>
      </div>

      <div className="border-t border-gray-200"></div>

      {/* 자유 게시판 */}
      <div>
        <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">
          {language === 'ko' ? '📝 자유 게시판' : '📝 Free Board'}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Link href="/community">
            <button className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
              pathname === '/community' && !freeCategoryParam
                ? 'text-black shadow-lg border-2 border-purple-800'
                : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
            }`}>
              {language === 'ko' ? '전체' : 'All'}
            </button>
          </Link>

          {freeCategories.map(cat => (
            <Link key={cat.id} href={`/community?category=${cat.id}`}>
              <button className={`px-4 py-2.5 rounded-lg font-semibold transition-all ${
                freeCategoryParam === cat.id
                  ? 'text-black shadow-lg border-2 border-purple-800'
                  : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
              }`}>
                {cat.name}
              </button>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}