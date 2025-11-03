import { Suspense } from 'react';
import QuestionList from './QuestionList';
import DailyMission from './DailyMission';

export default async function QuestionsPage({
  searchParams
}: {
  searchParams: { category?: string; format?: string };
}) {
  const category = searchParams.category;
  const format = searchParams.format;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Daily Mission */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-32 rounded-xl mb-6"></div>}>
        <DailyMission />
      </Suspense>

      {/* Question List */}
      <Suspense fallback={<div className="animate-pulse bg-gray-200 h-96 rounded-xl"></div>}>
        <QuestionList category={category} format={format} />
      </Suspense>
    </div>
  );
}
