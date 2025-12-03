'use client';

import { useState } from 'react';
import AnswerItem from './AnswerItem';
import { useLocale } from 'next-intl';

interface AnswerListProps {
  answers: any[];
  questionId: number;
  currentUserUuid: string | null;
}

export default function AnswerList({ answers, questionId, currentUserUuid }: AnswerListProps) {
  const [answersList, setAnswersList] = useState(answers);
  const locale = useLocale();
  
  if (!answersList || answersList.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">💭</div>
        <p className="text-gray-500 text-lg">{locale === 'ko' ? '아직 답변이 없습니다' : 'No answers yet'}</p>
        <p className="text-gray-400 text-sm mt-2">{locale === 'ko' ? '첫 번째 답변을 남겨보세요!' : 'Leave the first answer!'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {answersList.map((answer, index) => (
        <AnswerItem
          key={answer.id}
          answer={answer}
          index={index}
          questionId={questionId}
          currentUserUuid={currentUserUuid}
          onAnswerUpdated={(updatedAnswer) => {
            setAnswersList(prev =>
              prev.map(a => a.id === updatedAnswer.id ? updatedAnswer : a)
            );
          }}
        />
      ))}
    </div>
  );
}
