'use client';

import { useSearchParams } from 'next/navigation';
import QuestionList from './questions/QuestionList';
import DailyMission from './questions/DailyMission';
import { Suspense } from 'react';

export default function QuestionsView({ isMainPage = false }: { isMainPage?: boolean }) {
  const searchParams = useSearchParams();

  const topicId = searchParams?.get('topic') ?? undefined;
  const tagId = searchParams?.get('tag') ?? undefined;
  const filter = searchParams?.get('filter') ?? undefined;

  console.log('=== QuestionsView 렌더링됨 ===');
  console.log('filter:', filter);
  console.log('topicId:', topicId);
  console.log('tagId:', tagId);

  return (
    <div className="space-y-6">
      {/* Daily Questions */}
      {/* <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-xl mb-6" />}>
        <DailyMission />
      </Suspense> */}

      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-xl" />}>
        <QuestionList category={topicId} format={tagId} filter={filter} isMainPage={isMainPage} />
      </Suspense>
    </div>
  );
}
