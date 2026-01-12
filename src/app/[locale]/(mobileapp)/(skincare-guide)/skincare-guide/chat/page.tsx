'use client';

import { useState, useRef, useEffect } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigation } from '@/hooks/useNavigation';
import { AGE_LABELS, SKIN_TYPE_LABELS, CONCERN_LABELS } from '../../lib/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  suggestions?: string[];
  timestamp: Date;
}

export default function SkincareChatPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const { goBack } = useNavigation();
  const locale = (params?.locale as string) || 'ko';
  const lang = locale === 'ko' ? 'ko' : 'en';

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse user context from URL params
  const context = {
    ageGroup: searchParams.get('age') || '20s',
    skinType: searchParams.get('skin') || 'normal',
    concerns: searchParams.get('concerns')?.split(',').filter(Boolean) || [],
  };

  const texts = {
    ko: {
      title: 'AI 스킨케어 상담',
      placeholder: '스킨케어에 대해 질문해보세요...',
      send: '전송',
      typing: '답변을 작성 중...',
      source: '출처',
      suggestions: '다음 질문을 해보세요',
      greeting: '안녕하세요! 저는 스킨케어 가이드 AI입니다. 피부 관리에 대한 궁금한 점을 물어보세요.',
      yourProfile: '나의 피부 프로필',
    },
    en: {
      title: 'AI Skincare Consultation',
      placeholder: 'Ask about skincare...',
      send: 'Send',
      typing: 'Typing...',
      source: 'Source',
      suggestions: 'Try asking',
      greeting: "Hello! I'm your skincare guide AI. Feel free to ask me about skincare.",
      yourProfile: 'Your Skin Profile',
    },
  };

  const ui = texts[lang];

  // Initialize with greeting message
  useEffect(() => {
    const greeting: Message = {
      id: 'greeting',
      role: 'assistant',
      content: ui.greeting,
      suggestions: [
        lang === 'ko' ? '선크림은 언제 발라야 하나요?' : 'When should I apply sunscreen?',
        lang === 'ko' ? '스킨케어 제품 바르는 순서는?' : 'What is the correct skincare routine?',
        lang === 'ko' ? '레티놀은 어떻게 사용하나요?' : 'How do I use retinol?',
      ],
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, [lang, ui.greeting]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message
  const handleSend = async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/skincare-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          locale,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Add assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        sources: data.sources,
        suggestions: data.suggestions,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: lang === 'ko'
          ? '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.'
          : 'Sorry, an error occurred. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  // Handle keyboard submit
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Get profile labels
  const getAgeLabel = () => AGE_LABELS[context.ageGroup]?.[lang] || context.ageGroup;
  const getSkinLabel = () => SKIN_TYPE_LABELS[context.skinType]?.[lang] || context.skinType;

  // Format message content (support markdown-like formatting)
  const formatContent = (content: string) => {
    // Split by double newlines for paragraphs
    const paragraphs = content.split('\n\n');

    return paragraphs.map((p, i) => {
      // Check for bold text
      const parts = p.split(/\*\*(.*?)\*\*/g);

      return (
        <p key={i} className="mb-2 last:mb-0">
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="font-semibold">{part}</strong>
            ) : (
              <span key={j}>{part}</span>
            )
          )}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 px-4 py-3 border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={goBack}
            className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center">
            <h1 className="text-lg font-bold text-gray-900">{ui.title}</h1>
          </div>
          <div className="w-10" />
        </div>

        {/* User Profile Summary */}
        <div className="mt-2 flex items-center gap-2 text-xs overflow-x-auto pb-1">
          <span className="text-gray-500 flex-shrink-0">{ui.yourProfile}:</span>
          <span className="px-2 py-0.5 bg-blue-200 text-black rounded-full flex-shrink-0">
            {getAgeLabel()}
          </span>
          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full flex-shrink-0">
            {getSkinLabel()}
          </span>
          {context.concerns.slice(0, 2).map((concern, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 bg-green-200 text-black rounded-full flex-shrink-0"
            >
              {CONCERN_LABELS[concern]?.[lang] || concern}
            </span>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-md'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                }`}
              >
                {/* Message Content */}
                <div className="text-sm leading-relaxed">
                  {formatContent(message.content)}
                </div>

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{ui.source}: </span>
                    <span className="text-xs text-gray-500">
                      {message.sources.join(', ')}
                    </span>
                  </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-2">{ui.suggestions}:</p>
                    <div className="flex flex-wrap gap-2">
                      {message.suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white text-gray-500 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm">{ui.typing}</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 p-3 shadow-lg">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={ui.placeholder}
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
