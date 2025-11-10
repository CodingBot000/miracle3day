import { Suspense } from 'react';
import QuestionList from './QuestionList';
import DailyMission from './DailyMission';

export default async function QuestionsPage({
  searchParams
}: {
  searchParams: { topic?: string; category?: string; format?: string; filter?: string };
}) {
  const topic = searchParams.topic;
  const category = searchParams.category;
  const format = searchParams.format;
  const filter = searchParams.filter;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Daily Mission */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-xl mb-6"></div>}>
        <DailyMission />
      </Suspense>

      {/* Question List */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-xl"></div>}>
        <QuestionList topic={topic} category={category} format={format} filter={filter} />
      </Suspense>
    </div>
  );
}
