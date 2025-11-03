'use client';

import { useState } from 'react';
import { toast } from 'sonner';

interface PollQuestionProps {
  question: any;
}

export default function PollQuestion({ question }: PollQuestionProps) {
  const [voted, setVoted] = useState(false);
  const [options, setOptions] = useState(question.poll_options || []);
  const [loading, setLoading] = useState(false);

  const handleVote = async (optionId: number) => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/community/daily-questions/${question.id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_option: optionId })
      });

      if (res.ok) {
        const { options: updatedOptions } = await res.json();
        setOptions(updatedOptions);
        setVoted(true);
        toast.success(`🎉 +${question.points_reward} points earned!`);
      } else {
        const { error } = await res.json();
        toast.error(error || 'Failed to vote');
      }
    } catch (error) {
      console.error('Vote error:', error);
      toast.error('Failed to vote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const totalVotes = options.reduce((sum: number, opt: any) => sum + opt.vote_count, 0);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full">
          📊 QUICK POLL · 1초 참여
        </span>
        <span className="bg-yellow-100 text-yellow-800 text-sm font-bold px-3 py-1 rounded-full">
          +{question.points_reward} pts
        </span>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">{question.title}</h3>
      {question.subtitle && <p className="text-gray-600 mb-4">{question.subtitle}</p>}

      <div className="space-y-3 mt-4">
        {options.map((option: any) => {
          const percentage = totalVotes > 0
            ? Math.round((option.vote_count / totalVotes) * 100)
            : 0;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={voted || loading}
              className={`w-full relative overflow-hidden p-4 rounded-lg border-2 transition ${
                voted || loading
                  ? 'cursor-default'
                  : 'hover:border-green-500 hover:bg-green-50 cursor-pointer'
              }`}
            >
              <div
                className="absolute left-0 top-0 h-full bg-green-200 opacity-30 transition-all duration-500"
                style={{ width: voted ? `${percentage}%` : '0%' }}
              />
              <div className="relative flex justify-between items-center">
                <span className="font-semibold text-gray-900">{option.option_text}</span>
                {voted && (
                  <span className="text-green-700 font-bold text-lg">{percentage}%</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {voted && (
        <p className="text-gray-500 text-sm mt-3">
          👥 {totalVotes} people voted
        </p>
      )}
    </div>
  );
}
