'use client'

import { createContext, useCallback, useContext, useMemo, useState, useEffect, useRef, type ReactNode } from 'react'
import type { CommunityCategory } from '@/models/communityData.dto'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import Logo from '@/components/molecules/Logo'
import { useLoginGuard } from '@/hooks/useLoginGuard'
import { getFilterButtonClass } from './utils'

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
  const router = useRouter()
  const locale = useLocale()
  const currentView = searchParams.get('view') || 'posts'
  const currentTopic = searchParams.get('topic')
  const currentTag = searchParams.get('tag')

  // Refs
  const filtersRef = useRef<HTMLDivElement>(null)
  const topicsScrollRef = useRef<HTMLDivElement>(null)
  const tagsScrollRef = useRef<HTMLDivElement>(null)
  const stickyTopicsScrollRef = useRef<HTMLDivElement>(null)
  const stickyTagsScrollRef = useRef<HTMLDivElement>(null)

  // States
  const [showStickyFilters, setShowStickyFilters] = useState(false)
  const [showTopicsFade, setShowTopicsFade] = useState(false)
  const [showTagsFade, setShowTagsFade] = useState(false)

  // Login guard for Write button
  const { requireLogin, loginModal } = useLoginGuard()

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
    return jsonbField[locale] || jsonbField.ko || jsonbField.en || ''
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

  // 탭 전환 시 스크롤 최상단으로
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentView])

  // Intersection Observer - 필터 가시성 감지 (currentView 변경 시 재설정)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyFilters(!entry.isIntersecting)
      },
      { threshold: 0, rootMargin: '-120px 0px 0px 0px' }
    )

    if (filtersRef.current) {
      observer.observe(filtersRef.current)
    }

    return () => observer.disconnect()
  }, [currentView])

  // 스크롤 가능 여부 확인
  useEffect(() => {
    const checkScroll = () => {
      if (topicsScrollRef.current) {
        setShowTopicsFade(topicsScrollRef.current.scrollWidth > topicsScrollRef.current.clientWidth)
      }
      if (tagsScrollRef.current) {
        setShowTagsFade(tagsScrollRef.current.scrollWidth > tagsScrollRef.current.clientWidth)
      }
    }

    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [categories])

  const topicCategories = categories.filter(cat => cat.category_type === 'topic')
  const tagCategories = categories.filter(cat => cat.category_type === 'free')

  // Write Post 핸들러
  const handleWritePost = () => {
    if (!requireLogin()) return

    const params = new URLSearchParams()
    if (currentTopic) params.set('defaultTopic', currentTopic)
    if (currentTag) params.set('defaultTag', currentTag)

    const queryString = params.toString()
    router.push(queryString ? `/community/write?${queryString}` : '/community/write')
  }

  // 필터 버튼 렌더링 함수 (중복 제거)
  const renderTopicButtons = (compact = false) => (
    <>
      <Link
        href={buildUrl({ tag: currentTag })}
        className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
          getFilterButtonClass(null, !currentTopic, 'topic')
        }`}
      >
        {locale === 'ko' ? '전체' : 'All'}
      </Link>
      {topicCategories.map(topic => (
        <Link
          key={topic.id}
          href={buildUrl({ topic: topic.id, tag: currentTag })}
          className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
            getFilterButtonClass(topic.id, currentTopic === topic.id, 'topic')
          }`}
        >
          {getText(topic.name)}
        </Link>
      ))}
    </>
  )

  const renderTagButtons = (compact = false) => (
    <>
      <Link
        href={buildUrl({ topic: currentTopic })}
        className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
          getFilterButtonClass(null, !currentTag, 'free')
        }`}
      >
        {locale === 'ko' ? '전체' : 'All'}
      </Link>
      {tagCategories.map(tag => (
        <Link
          key={tag.id}
          href={buildUrl({ topic: currentTopic, tag: tag.id })}
          className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs whitespace-nowrap transition-colors ${
            getFilterButtonClass(tag.id, currentTag === tag.id, 'free')
          }`}
        >
          {getText(tag.name)}
        </Link>
      ))}
    </>
  )

  const scrollStyle = {
    scrollbarWidth: 'none' as const,
    msOverflowStyle: 'none' as const,
    WebkitOverflowScrolling: 'touch' as const,
  }

  return (
    <CommunityHeaderContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50">
        {/* 고정 헤더 */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          {/* 메인 헤더 row */}
          <div className="max-w-[1200px] mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              {/* 왼쪽: 로고 + 탭 */}
              <div className="flex items-center gap-6">
                <Logo />
                <nav className="flex items-center gap-1">
                  <Link
                    href="/community?view=posts"
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                      currentView === 'posts'
                        ? 'text-pink-600 font-bold border-pink-600'
                        : 'text-gray-600 border-transparent hover:text-gray-900'
                    }`}
                  >
                    {locale === 'ko' ? '게시판' : 'Posts'}
                  </Link>
                  <Link
                    href="/community?view=questions"
                    className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                      currentView === 'questions'
                        ? 'text-pink-600 font-bold border-pink-600'
                        : 'text-gray-600 border-transparent hover:text-gray-900'
                    }`}
                  >
                    {locale === 'ko' ? '데일리 질문' : 'Daily-Q'}
                  </Link>
                </nav>
              </div>

              {/* 오른쪽: Write Post 버튼 */}
              <button
                type="button"
                onClick={handleWritePost}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors"
              >
                {locale === 'ko' ? '글쓰기' : 'Write'}
              </button>
            </div>
          </div>

          {/* Sticky 필터 (스크롤 시 표시) */}
          {showStickyFilters && (
            <div className="border-t border-gray-100 bg-white/95 backdrop-blur-sm">
              <div className="max-w-[1200px] mx-auto px-4 py-2 space-y-2">
                {/* Topics */}
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-gray-500 w-14 flex-shrink-0">TOPICS</span>
                  <div
                    ref={stickyTopicsScrollRef}
                    className="flex gap-1.5 overflow-x-auto scrollbar-hide"
                    style={scrollStyle}
                  >
                    {renderTopicButtons(true)}
                  </div>
                </div>
                {/* Tags - posts 탭에만 표시 */}
                {currentView === 'posts' && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-gray-500 w-14 flex-shrink-0">TAGS</span>
                    <div
                      ref={stickyTagsScrollRef}
                      className="flex gap-1.5 overflow-x-auto scrollbar-hide"
                      style={scrollStyle}
                    >
                      {renderTagButtons(true)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </header>

        {/* 메인 콘텐츠 */}
        <div className="max-w-[1200px] mx-auto px-4 py-6">
          {headerContent ?? (
            <>
              {/* 원본 필터 영역 (Intersection Observer 감지 대상) */}
              {currentView === 'posts' && (
                <div ref={filtersRef} className="bg-white rounded-xl border border-gray-100 p-3 mb-4">
                  {/* Topics */}
                  <div className="mb-2">
                    <h3 className="text-xs font-semibold text-gray-500 mb-1.5">
                      {locale === 'ko' ? '주제' : 'TOPICS'}
                    </h3>
                    <div className="relative">
                      <div
                        ref={topicsScrollRef}
                        className="flex gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth"
                        style={scrollStyle}
                      >
                        {renderTopicButtons()}
                        <div className="flex-shrink-0 w-4" />
                      </div>
                      {showTopicsFade && (
                        <div className="absolute top-0 right-0 h-full w-12 pointer-events-none bg-gradient-to-l from-white to-transparent" />
                      )}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 mb-1.5">
                      {locale === 'ko' ? '태그' : 'TAGS'}
                    </h3>
                    <div className="relative">
                      <div
                        ref={tagsScrollRef}
                        className="flex gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth"
                        style={scrollStyle}
                      >
                        {renderTagButtons()}
                        <div className="flex-shrink-0 w-4" />
                      </div>
                      {showTagsFade && (
                        <div className="absolute top-0 right-0 h-full w-12 pointer-events-none bg-gradient-to-l from-white to-transparent" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Questions 탭일 때 필터 */}
              {currentView === 'questions' && (
                <div ref={filtersRef} className="bg-white rounded-xl border border-gray-100 p-3 mb-4">
                  <div className="mb-2">
                    <h3 className="text-xs font-semibold text-gray-500 mb-1.5">
                      {locale === 'ko' ? '주제' : 'TOPICS'}
                    </h3>
                    <div className="relative">
                      <div
                        ref={topicsScrollRef}
                        className="flex gap-1.5 overflow-x-auto scrollbar-hide scroll-smooth"
                        style={scrollStyle}
                      >
                        {renderTopicButtons()}
                        <div className="flex-shrink-0 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Children */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="p-4">
              {children}
            </div>
          </div>
        </div>

        {/* Login Modal */}
        {loginModal}
      </div>
    </CommunityHeaderContext.Provider>
  )
}
