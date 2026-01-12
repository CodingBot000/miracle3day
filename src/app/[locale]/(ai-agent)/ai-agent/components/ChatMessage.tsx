'use client';

import { motion } from 'framer-motion';
import { Message } from './types';

interface ChatMessageProps {
  message: Message;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export default function ChatMessage({
  message,
  suggestions,
  onSuggestionClick,
}: ChatMessageProps) {
  const isUser = message.role === 'user';

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
            : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
        }`}
      >
        {/* Message Content */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {formatContent(message.content)}
        </div>

        {/* Metadata (for assistant messages) */}
        {!isUser && message.metadata?.complexity && (
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                message.metadata.complexity === 'simple'
                  ? 'bg-green-100 text-green-700'
                  : message.metadata.complexity === 'medium'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {message.metadata.complexity}
            </span>
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
                  💬 {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
