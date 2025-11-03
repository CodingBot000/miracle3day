'use client';

import PollQuestion from './PollQuestion';
import SituationQuestion from './SituationQuestion';
import OpenQuestion from './OpenQuestion';

type QuestionType = 'poll' | 'situation' | 'open';

interface Question {
  question_type: QuestionType;
  [key: string]: any;
}

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  const borderColor: Record<QuestionType, string> = {
    poll: 'border-l-green-500',
    situation: 'border-l-orange-500',
    open: 'border-l-purple-600'
  };

  const selectedBorderColor = borderColor[question.question_type] || 'border-l-gray-300';

  return (
    <div className={`bg-white rounded-xl p-6 shadow-lg border-l-8 ${selectedBorderColor} hover:shadow-xl transition`}>
      {question.question_type === 'poll' && <PollQuestion question={question} />}
      {question.question_type === 'situation' && <SituationQuestion question={question} />}
      {question.question_type === 'open' && <OpenQuestion question={question} />}
    </div>
  );
}
