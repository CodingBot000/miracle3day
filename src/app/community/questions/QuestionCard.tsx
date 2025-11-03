'use client';

import PollQuestion from './PollQuestion';
import SituationQuestion from './SituationQuestion';
import OpenQuestion from './OpenQuestion';

interface QuestionCardProps {
  question: any;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const borderColor = {
    poll: 'border-l-green-500',
    situation: 'border-l-orange-500',
    open: 'border-l-purple-600'
  }[question.question_type] || 'border-l-gray-300';

  return (
    <div className={`bg-white rounded-xl p-6 shadow-lg border-l-8 ${borderColor} hover:shadow-xl transition`}>
      {question.question_type === 'poll' && <PollQuestion question={question} />}
      {question.question_type === 'situation' && <SituationQuestion question={question} />}
      {question.question_type === 'open' && <OpenQuestion question={question} />}
    </div>
  );
}
