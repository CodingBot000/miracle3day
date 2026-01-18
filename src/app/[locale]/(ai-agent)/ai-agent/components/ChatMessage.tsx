'use client';

import { motion } from 'framer-motion';
import type { Message, AIAgentStatus } from './types';

interface ChatMessageProps {
  message: Message;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

// 상태별 뱃지 스타일
const STATUS_BADGE_STYLES: Record<AIAgentStatus, string> = {
  complete: 'bg-green-100 text-green-700',
  waiting: 'bg-yellow-100 text-yellow-700',
  clarification: 'bg-blue-100 text-blue-700',
  error: 'bg-red-100 text-red-700',
};

// 상태별 라벨
const STATUS_LABELS: Record<AIAgentStatus, string> = {
  complete: '완료',
  waiting: '확인 대기',
  clarification: '추가 정보 필요',
  error: '오류',
};

export default function ChatMessage({
  message,
  suggestions,
  onSuggestionClick,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  // Format message content with line breaks
  const formatContent = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, i) => (
      <span key={i}>
        {line}
        {i < lines.length - 1 && <br />}
      </span>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : isSystem
            ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-bl-md'
            : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
        }`}
      >
        {/* Message Content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {formatContent(message.content)}
        </div>

        {/* Execution Plan (for system messages) */}
        {message.metadata?.executionPlan && message.metadata.executionPlan.length > 0 && (
          <div className="mt-3 pt-3 border-t border-amber-200">
            <p className="text-xs font-medium text-amber-700 mb-2">실행 계획:</p>
            <ul className="space-y-1">
              {message.metadata.executionPlan.map((step, i) => (
                <li key={i} className="text-xs text-amber-800 font-mono bg-amber-100 px-2 py-1 rounded">
                  {i + 1}. {step.tool}({JSON.stringify(step.args)})
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Metadata (for assistant messages) */}
        {!isUser && !isSystem && message.metadata && (
          <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap items-center gap-2">
            {/* Status Badge */}
            {message.metadata.status && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  STATUS_BADGE_STYLES[message.metadata.status]
                }`}
              >
                {STATUS_LABELS[message.metadata.status]}
              </span>
            )}

            {/* Confidence */}
            {message.metadata.confidence !== undefined && (
              <span className="text-xs text-gray-500">
                신뢰도: {Math.round(message.metadata.confidence * 100)}%
              </span>
            )}

            {/* API Calls */}
            {message.metadata.apiCalls !== undefined && message.metadata.apiCalls > 0 && (
              <span className="text-xs text-gray-500">
                API: {message.metadata.apiCalls}회
              </span>
            )}
          </div>
        )}

        {/* Suggestions (only for greeting message) */}
        {suggestions && suggestions.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex flex-col gap-2">
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="text-left text-sm px-3 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
