'use client';

import { useState, useRef, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import {
  ChatMessage,
  ChatInput,
  ChatHeader,
  TypingIndicator,
  ApprovalButtons,
  Message,
  UITexts,
  AIAgentResponse,
} from './components';
import { aiAgentClient } from '@/lib/ai-agent-client';

const UI_TEXTS: Record<'ko' | 'en', UITexts> = {
  ko: {
    title: 'AI 뷰티 상담',
    subtitle: 'Beauty AI Agent v7.8',
    placeholder: '피부과, 성형외과, 스킨케어 등 무엇이든 물어보세요...',
    send: '전송',
    typing: '답변을 작성 중...',
    greeting:
      '안녕하세요! 저는 뷰티 AI 상담사입니다.\n\n피부과, 성형외과, 스킨케어 루틴 등 K-Beauty에 관한 모든 궁금증을 해결해드릴게요.',
    suggestions: [
      '서울 강남구 피부과 추천해줘',
      '레티놀 사용법 알려줘',
      '여드름 피부 관리 방법',
    ],
    error: '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.',
    approvalTitle: '다음 작업을 실행할까요?',
    approvalConfirm: '진행',
    approvalCancel: '취소',
    approvalModify: '수정',
    clarificationHint: '더 자세한 정보가 필요합니다.',
  },
  en: {
    title: 'AI Beauty Consultation',
    subtitle: 'Beauty AI Agent v7.8',
    placeholder: 'Ask about dermatology, plastic surgery, skincare...',
    send: 'Send',
    typing: 'Typing...',
    greeting:
      "Hello! I'm your Beauty AI consultant.\n\nI can help you with dermatology, plastic surgery, skincare routines, and everything about K-Beauty.",
    suggestions: [
      'Recommend dermatology clinics in Gangnam',
      'How to use retinol properly',
      'Acne skin care tips',
    ],
    error: 'Sorry, an error occurred. Please try again.',
    approvalTitle: 'Should I execute these actions?',
    approvalConfirm: 'Proceed',
    approvalCancel: 'Cancel',
    approvalModify: 'Modify',
    clarificationHint: 'I need more information.',
  },
};

export default function AIAgentPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'ko';
  const lang: 'ko' | 'en' = locale === 'ko' ? 'ko' : 'en';
  const ui = UI_TEXTS[lang];

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingApproval, setPendingApproval] = useState<AIAgentResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting message
  useEffect(() => {
    const greeting: Message = {
      id: 'greeting',
      role: 'assistant',
      content: ui.greeting,
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, [ui.greeting]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, pendingApproval]);

  // Process AI response
  const processResponse = (response: AIAgentResponse) => {
    // Save session ID
    if (response.session_id) {
      setSessionId(response.session_id);
    }

    // Check if approval is needed
    if (response.approval_needed) {
      setPendingApproval(response);

      // Add system message with execution plan
      const systemMessage: Message = {
        id: `${Date.now()}-system`,
        role: 'system',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          status: response.status,
          executionPlan: response.execution_plan || undefined,
          confidence: response.confidence || undefined,
        },
      };
      setMessages((prev) => [...prev, systemMessage]);
    } else {
      // Normal response
      const assistantMessage: Message = {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        metadata: {
          status: response.status,
          confidence: response.confidence || undefined,
          apiCalls: response.api_calls,
        },
      };
      setMessages((prev) => [...prev, assistantMessage]);
    }
  };

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
      const result = await aiAgentClient.sendMessage(text, sessionId || undefined);

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to get response');
      }

      processResponse(result.data);
    } catch (error) {
      console.error('AI Agent error:', error);

      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: ui.error,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle approval feedback
  const handleApprovalFeedback = async (feedback: 'ok' | 'cancel' | 'modify') => {
    if (!pendingApproval || !sessionId) return;

    setIsLoading(true);
    setPendingApproval(null);

    try {
      const result = await aiAgentClient.sendFeedback(sessionId, feedback);

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Failed to send feedback');
      }

      processResponse(result.data);
    } catch (error) {
      console.error('AI Agent feedback error:', error);

      const errorMessage: Message = {
        id: `${Date.now()}-error`,
        role: 'assistant',
        content: ui.error,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto w-full">
      {/* Header with back button */}
      <ChatHeader title={ui.title} subtitle={ui.subtitle} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 space-y-4">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              suggestions={message.id === 'greeting' ? ui.suggestions : undefined}
              onSuggestionClick={handleSend}
            />
          ))}
        </AnimatePresence>

        {/* Approval Buttons */}
        {pendingApproval && !isLoading && (
          <ApprovalButtons
            onApprove={() => handleApprovalFeedback('ok')}
            onCancel={() => handleApprovalFeedback('cancel')}
            onModify={() => handleApprovalFeedback('modify')}
            disabled={isLoading}
            labels={{
              approve: ui.approvalConfirm || '진행',
              cancel: ui.approvalCancel || '취소',
              modify: ui.approvalModify || '수정',
            }}
          />
        )}

        {/* Typing Indicator */}
        {isLoading && <TypingIndicator text={ui.typing} />}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        value={input}
        onChange={setInput}
        onSend={() => handleSend()}
        placeholder={ui.placeholder}
        disabled={isLoading || !!pendingApproval}
      />
    </div>
  );
}
