'use client'

import { createContext, useCallback, useContext, useMemo, useState, useEffect, useRef, type ReactNode } from 'react'
import type { CommunityCategory } from '@/app/models/communityData.dto'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import Logo from '@/components/molecules/Logo'
import { useLoginGuard } from '@/hooks/useLoginGuard'
import { toast } from 'sonner'
import { Share2 } from 'lucide-react'

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

  // Intersection Observer - 필터 가시성 감지
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
  }, [])

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

  // Share 핸들러
  const handleShare = async () => {
    const url = window.location.href
    try {
      await navigator.clipboard.writeText(url)
      const messages: Record<string, string> = {
        ko: '공유 가능한 주소를 클립보드에 복사했습니다.',
        en: 'Shareable link copied to clipboard.',
        ja: '共有可能なリンクをクリップボードにコピーしました。',
        'zh-CN': '已将可分享的链接复制到剪贴板。',
        'zh-TW': '已將可分享的連結複製到剪貼簿。',
      }
      toast.success(messages[locale] || messages.en)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  // 필터 버튼 렌더링 함수 (중복 제거)
  const renderTopicButtons = (compact = false) => (
    <>
      <Link
        href={buildUrl({ tag: currentTag })}
        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
          !currentTopic
            ? 'bg-pink-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${compact ? 'text-xs' : ''}`}
      >
        {locale === 'ko' ? '전체' : 'All'}
      </Link>
      {topicCategories.map(topic => (
        <Link
          key={topic.id}
          href={buildUrl({ topic: topic.id, tag: currentTag })}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
            currentTopic === topic.id
              ? 'bg-pink-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${compact ? 'text-xs' : ''}`}
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
        className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
          !currentTag
            ? 'bg-pink-600 text-white'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${compact ? 'text-xs' : ''}`}
      >
        {locale === 'ko' ? '전체' : 'All'}
      </Link>
      {tagCategories.map(tag => (
        <Link
          key={tag.id}
          href={buildUrl({ topic: currentTopic, tag: tag.id })}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
            currentTag === tag.id
              ? 'bg-pink-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } ${compact ? 'text-xs' : ''}`}
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
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'posts'
                        ? 'bg-pink-50 text-pink-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {locale === 'ko' ? '게시판' : 'Posts'}
                  </Link>
                  <Link
                    href="/community?view=questions"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentView === 'questions'
                        ? 'bg-pink-50 text-pink-600'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {locale === 'ko' ? '데일리 질문' : 'Daily-Q'}
                  </Link>
                </nav>
              </div>

              {/* 오른쪽: Write Post + Share 버튼 */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleWritePost}
                  className="bg-pink-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-pink-700 transition-colors"
                >
                  {locale === 'ko' ? '글쓰기' : 'Write'}
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Share"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sticky 필터 (스크롤 시 표시) */}
          {showStickyFilters && currentView === 'posts' && (
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
                {/* Tags */}
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
                <div ref={filtersRef} className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
                  {/* Topics */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      {locale === 'ko' ? '🎨 주제' : '🎨 TOPICS'}
                    </h3>
                    <div className="relative">
                      <div
                        ref={topicsScrollRef}
                        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
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
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      {locale === 'ko' ? '📂 태그' : '📂 TAGS'}
                    </h3>
                    <div className="relative">
                      <div
                        ref={tagsScrollRef}
                        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
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
                <div ref={filtersRef} className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      {locale === 'ko' ? '🎨 주제' : '🎨 TOPICS'}
                    </h3>
                    <div className="relative">
                      <div
                        ref={topicsScrollRef}
                        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth"
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
            <div className="p-6">
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
