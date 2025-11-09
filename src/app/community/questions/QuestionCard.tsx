'use client';

import PollQuestion from './PollQuestion';
import SituationQuestion from './SituationQuestion';
import OpenQuestion from './OpenQuestion';

type QuestionType = 'poll' | 'situation' | 'open';

interface PollOption {
  id: number;
  option_text: string | { en: string; ko: string };
  vote_count: number;
  display_order: number;
  is_selected_by_user?: boolean;
}

interface Question {
  id: number;
  question_type: QuestionType;
  title: string | { en: string; ko: string };
  subtitle?: string | { en: string; ko: string };
  points_reward: number;
  poll_options?: PollOption[];
  user_has_voted?: boolean;
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
      {question.question_type === 'poll' && question.poll_options && (
        <PollQuestion question={{
          id: question.id,
          title: question.title,
          subtitle: question.subtitle,
          points_reward: question.points_reward,
          poll_options: question.poll_options,
          user_has_voted: question.user_has_voted
        }} />
      )}
      {question.question_type === 'situation' && <SituationQuestion question={question} />}
      {question.question_type === 'open' && <OpenQuestion question={question} />}
    </div>
  );
}
