import { log } from '@/utils/logger';
import { getLocale } from 'next-intl/server';
import { Suspense } from 'react';
import QuestionsView from './QuestionsView';
import PostsView from './PostsView';
import DailyMission from "./questions/DailyMission";

interface CommunityPageProps {
  searchParams?: {
    view?: 'posts' | 'questions';
    topic?: string;
    tag?: string;
    filter?: string;
  }
}

export default async function CommunityHomePage({ searchParams }: CommunityPageProps) {
  const locale = await getLocale();
  const language = (locale === 'ko' ? 'ko' : 'en') as 'ko' | 'en';

  // 기본값: posts
  const currentView = searchParams?.view || 'posts';
  const topicId = searchParams?.topic;
  const tagId = searchParams?.tag;

  log.debug('=== HomePage (서버) 렌더링됨 ===');
  log.debug('currentView:', currentView);
  log.debug('searchParams:', searchParams);

  // Questions 뷰일 때
  if (currentView === 'questions') {
    return (
      <>
        {/* <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-xl mb-6" />}>
          <DailyMission />
        </Suspense> */}
        <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-xl" />}>
          <QuestionsView />
        </Suspense>
      </>
    );
  }

  // Posts 뷰
  return (
    <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-xl" />}>
      {/* @ts-ignore - Async Server Component */}
      <PostsView topicId={topicId} tagId={tagId} language={language} />
    </Suspense>
  );
}
