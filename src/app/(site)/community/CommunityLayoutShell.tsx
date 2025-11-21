'use client'

import { createContext, useCallback, useContext, useMemo, useState, useEffect, useRef, type ReactNode } from 'react'
import type { CommunityCategory } from '@/app/models/communityData.dto'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useCookieLanguage } from '@/hooks/useCookieLanguage'

type CommunityHeaderContextValue = {
  setHeaderContent: (content: ReactNode | null) => void
}

const CommunityHeaderContext = createContext<CommunityHeaderContextValue | undefined>(undefined)

export function useCommunityHeader() {
  const context = useContext(CommunityHeaderContext)

  if (!context) {
    throw new Error('useCommunityHeader must be used within CommunityLayoutShell')
  }

  return context
}

interface CommunityLayoutShellProps {
  categories: CommunityCategory[]
  children: ReactNode
}

export default function CommunityLayoutShell({
  categories,
  children,
}: CommunityLayoutShellProps) {
  const [headerContent, setHeaderContentState] = useState<ReactNode | null>(null)
  const searchParams = useSearchParams()
  const { language } = useCookieLanguage()
  const currentView = searchParams.get('view') || 'posts'
  const currentTopic = searchParams.get('topic')
  const currentTag = searchParams.get('tag')

  const topicsRef = useRef<HTMLDivElement>(null)
  const tagsRef = useRef<HTMLDivElement>(null)
  const [showTopicsFade, setShowTopicsFade] = useState(false)
  const [showTagsFade, setShowTagsFade] = useState(false)

  const setHeaderContent = useCallback((content: ReactNode | null) => {
    setHeaderContentState(content)
  }, [])

  const contextValue = useMemo(
    () => ({ setHeaderContent }),
    [setHeaderContent],
  )

  // 다국어 텍스트 추출 헬퍼
  const getText = (jsonbField: any): string => {
    if (!jsonbField) return ''
    if (typeof jsonbField === 'string') return jsonbField

    // JSONB 객체에서 현재 언어로 추출
    return jsonbField[language] || jsonbField.ko || jsonbField.en || ''
  }

  // URL 빌더 헬퍼
  const buildUrl = (params: Record<string, string | null | undefined>) => {
    const urlParams = new URLSearchParams()
    urlParams.set('view', currentView)

    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value)
    })

    return `/community?${urlParams.toString()}`
  }

  // 스크롤 가능 여부 확인
  useEffect(() => {
    const checkScroll = () => {
      if (topicsRef.current) {
        const hasScroll = topicsRef.current.scrollWidth > topicsRef.current.clientWidth
        setShowTopicsFade(hasScroll)
      }
      if (tagsRef.current) {
        const hasScroll = tagsRef.current.scrollWidth > tagsRef.current.clientWidth
        setShowTagsFade(hasScroll)
      }
    }

    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [categories])

  const topicCategories = categories.filter(cat => cat.category_type === 'topic')
  const tagCategories = categories.filter(cat => cat.category_type === 'free')

  // Daily Questions용 필터 정의
  const DAILY_QUESTION_FILTERS = [
    { value: 'all', label: { en: 'All', ko: '전체' }, icon: '📋' },
    { value: 'trending', label: { en: 'Trending', ko: '인기' }, icon: '🔥' },
    { value: 'seasonal', label: { en: 'Seasonal', ko: '계절' }, icon: '🌸' },
    { value: 'urgent', label: { en: 'Urgent', ko: '긴급' }, icon: '⚡' },
    { value: 'beginner', label: { en: 'Beginner', ko: '초보' }, icon: '🌟' }
  ]

  return (
    <CommunityHeaderContext.Provider value={contextValue}>
      <div className="min-h-full bg-gray-50 py-8 sm:py-10">
        <div className="bg-white shadow-sm rounded-xl border border-gray-100">
          <header className="border-b border-gray-100 px-6 py-4">
            {/* <Link href="/community">
              <h1 className="text-xl font-semibold text-gray-900">Beauty Community</h1>
            </Link> */}

            {headerContent ?? (
              <div className="mt-6">
                {/* 탭 네비게이션 */}
                <div className="flex gap-2 border-b border-gray-200 mb-6">
                  <Link
                    href="/community?view=posts"
                    className={`px-6 py-3 ${
                      currentView === 'posts'
                        ? 'text-pink-600 border-b-2 border-pink-600 font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {language === 'ko' ? '📝 게시판' : '📝 Posts'}
                  </Link>
                  <Link
                    href="/community?view=questions"
                    className={`px-6 py-3 ${
                      currentView === 'questions'
                        ? 'text-pink-600 border-b-2 border-pink-600 font-semibold'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {language === 'ko' ? '💬 데일리 질문' : '💬 Daily Questions'}
                  </Link>
                </div>

                {/* Topics 필터 - Horizontal Scroll (Posts 탭에서만 표시) */}
                {currentView === 'posts' && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      {language === 'ko' ? '🎨 주제' : '🎨 TOPICS'}
                    </h3>
                    <div className="relative">
                      <div
                        ref={topicsRef}
                        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
                        style={{
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                          WebkitOverflowScrolling: 'touch'
                        }}
                      >
                        <Link
                          href={buildUrl({ tag: currentTag })}
                          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                            !currentTopic
                              ? 'bg-pink-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {language === 'ko' ? '전체' : 'All'}
                        </Link>
                        {topicCategories.map(topic => (
                          <Link
                            key={topic.id}
                            href={buildUrl({ topic: topic.id, tag: currentTag })}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                              currentTopic === topic.id
                                ? 'bg-pink-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {getText(topic.name)}
                          </Link>
                        ))}
                        {/* 여백 추가 - 마지막 항목 일부가 보이도록 */}
                        <div className="flex-shrink-0 w-4" />
                      </div>

                      {/* Fade Gradient - 오른쪽 */}
                      {showTopicsFade && (
                        <div
                          className="absolute top-0 right-0 h-full w-12 pointer-events-none bg-gradient-to-l from-white to-transparent"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Daily Questions - Topics + Filters (Questions 탭에서만 표시) */}
                {currentView === 'questions' && (
                  <>
                    {/* Topics 필터 - Daily Questions에도 표시 */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        {language === 'ko' ? '🎨 주제' : '🎨 TOPICS'}
                      </h3>
                      <div className="relative">
                        <div
                          ref={topicsRef}
                          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
                          style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                          }}
                        >
                          <Link
                            href={buildUrl({ tag: currentTag, filter: searchParams.get('filter') })}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                              !currentTopic
                                ? 'bg-pink-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {language === 'ko' ? '전체' : 'All'}
                          </Link>
                          {topicCategories.map(topic => (
                            <Link
                              key={topic.id}
                              href={buildUrl({ topic: topic.id, tag: currentTag, filter: searchParams.get('filter') })}
                              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                                currentTopic === topic.id
                                  ? 'bg-pink-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {getText(topic.name)}
                            </Link>
                          ))}
                          {/* 여백 추가 - 마지막 항목 일부가 보이도록 */}
                          <div className="flex-shrink-0 w-4" />
                        </div>

                        {/* Fade Gradient - 오른쪽 */}
                        {showTopicsFade && (
                          <div
                            className="absolute top-0 right-0 h-full w-12 pointer-events-none bg-gradient-to-l from-white to-transparent"
                          />
                        )}
                      </div>
                    </div>

                    {/* 필터 - Daily Questions 전용 */}
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">
                        {language === 'ko' ? '🏷️ 필터' : '🏷️ FILTERS'}
                      </h3>
                      <div className="relative">
                        <div
                          ref={tagsRef}
                          className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
                          style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitOverflowScrolling: 'touch'
                          }}
                        >
                          {DAILY_QUESTION_FILTERS.map(filter => (
                            <Link
                              key={filter.value}
                              href={buildUrl({ topic: currentTopic, filter: filter.value === 'all' ? undefined : filter.value })}
                              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                                (filter.value === 'all' && !searchParams.get('filter')) || searchParams.get('filter') === filter.value
                                  ? 'bg-pink-600 text-white'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {filter.icon} {getText(filter.label)}
                            </Link>
                          ))}
                          {/* 여백 추가 - 마지막 항목 일부가 보이도록 */}
                          <div className="flex-shrink-0 w-4" />
                        </div>

                        {/* Fade Gradient - 오른쪽 */}
                        {showTagsFade && (
                          <div
                            className="absolute top-0 right-0 h-full w-12 pointer-events-none bg-gradient-to-l from-white to-transparent"
                          />
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* Tags 필터 - Horizontal Scroll (Posts 탭에서만 표시) */}
                {currentView === 'posts' && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      {language === 'ko' ? '📂 태그' : '📂 TAGS'}
                    </h3>
                    <div className="relative">
                      <div
                        ref={tagsRef}
                        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
                        style={{
                          scrollbarWidth: 'none',
                          msOverflowStyle: 'none',
                          WebkitOverflowScrolling: 'touch'
                        }}
                      >
                        <Link
                          href={buildUrl({ topic: currentTopic })}
                          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                            !currentTag
                              ? 'bg-pink-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {language === 'ko' ? '전체' : 'All'}
                        </Link>
                        {tagCategories.map(tag => (
                          <Link
                            key={tag.id}
                            href={buildUrl({ topic: currentTopic, tag: tag.id })}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                              currentTag === tag.id
                                ? 'bg-pink-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {getText(tag.name)}
                          </Link>
                        ))}
                        {/* 여백 추가 */}
                        <div className="flex-shrink-0 w-4" />
                      </div>

                      {/* Fade Gradient - 오른쪽 */}
                      {showTagsFade && (
                        <div
                          className="absolute top-0 right-0 h-full w-12 pointer-events-none bg-gradient-to-l from-white to-transparent"
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </header>
          <div className="px-6 py-6">
            {children}
          </div>
        </div>
      </div>
    </CommunityHeaderContext.Provider>
  )
}
