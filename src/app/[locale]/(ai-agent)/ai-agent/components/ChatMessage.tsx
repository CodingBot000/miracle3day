'use client';

import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Message, AIAgentStatus } from './types';

interface ChatMessageProps {
  message: Message;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  showDevInfo?: boolean; // 로컬 개발 환경에서만 메타데이터 표시
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
  showDevInfo = false,
}: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

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
            ? 'bg-gray-200 text-black rounded-br-md'
            : isSystem
            ? 'bg-amber-50 text-amber-900 border border-amber-200 rounded-bl-md'
            : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
        }`}
      >
        {/* Message Content */}
        <div className="text-sm leading-relaxed prose prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              // Customize link styling
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  className="text-blue-500 hover:text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
              // Preserve line breaks
              p: ({ node, ...props }) => <p {...props} className="mb-2 last:mb-0" />,
              // Customize heading styles
              h2: ({ node, ...props }) => <h2 {...props} className="text-base font-semibold mt-3 mb-2 first:mt-0" />,
              h3: ({ node, ...props }) => <h3 {...props} className="text-sm font-semibold mt-2 mb-1" />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>

        {/* Execution Plan (for system messages) - 로컬 개발 환경에서만 표시 */}
        {showDevInfo && message.metadata?.executionPlan && message.metadata.executionPlan.length > 0 && (
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

        {/* Execution Logs - 로컬 개발 환경에서만 표시 */}
        {showDevInfo && message.metadata?.executionLogs && message.metadata.executionLogs.length > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200 bg-blue-50 rounded">
            <p className="text-xs font-medium text-blue-700 mb-2 px-2 pt-2">실행 로그:</p>
            <div className="max-h-64 overflow-y-auto px-2 pb-2">
              <ul className="space-y-0.5">
                {message.metadata.executionLogs.map((log, i) => (
                  <li key={i} className="text-xs text-blue-800 font-mono whitespace-pre-wrap">
                    {log}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Metadata (for assistant messages) - 로컬 개발 환경에서만 표시 */}
        {showDevInfo && !isUser && !isSystem && message.metadata && (
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
