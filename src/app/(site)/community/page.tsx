import { cookies } from "next/headers";
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

export default async function HomePage({ searchParams }: CommunityPageProps) {
  const cookieStore = cookies();
  const languageCookie = cookieStore.get('language');
  const language = (languageCookie?.value as 'ko' | 'en') || 'ko';

  // 기본값: posts
  const currentView = searchParams?.view || 'posts';
  const topicId = searchParams?.topic;
  const tagId = searchParams?.tag;

  console.log('=== HomePage (서버) 렌더링됨 ===');
  console.log('currentView:', currentView);
  console.log('searchParams:', searchParams);

  // Questions 뷰일 때
  if (currentView === 'questions') {
    return (
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-xl" />}>
              
        <DailyMission />
      
        <QuestionsView />
      </Suspense>
    );
  }

  // Posts 뷰
  return <PostsView topicId={topicId} tagId={tagId} language={language} />;
}
