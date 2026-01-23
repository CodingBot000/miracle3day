'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useSpeechRecognition } from './useSpeechRecognition';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  placeholder: string;
  disabled: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  placeholder,
  disabled,
}: ChatInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // 음성 인식 완료 시 전송 처리
  const handleVoiceComplete = useCallback(
    (text: string) => {
      onChange(text);
      // 다음 틱에서 전송 (상태 업데이트 후)
      setTimeout(() => {
        onSend();
      }, 100);
    },
    [onChange, onSend]
  );

  // 음성 인식 훅 사용
  const { voiceState, isSupported, isActive, toggleListening } =
    useSpeechRecognition({
      initialValue: value,
      onTranscriptChange: onChange,
      onComplete: handleVoiceComplete,
    });

  // Focus input when enabled
  useEffect(() => {
    if (!disabled && !isActive) {
      inputRef.current?.focus();
    }
  }, [disabled, isActive]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white border-t border-gray-200 p-4 shadow-lg">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isActive
              ? voiceState === 'speaking'
                ? '음성 입력 중...'
                : '음성 대기 중...'
              : placeholder
          }
          disabled={disabled || isActive}
          className={`flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors ${
            isActive ? 'bg-red-50 border border-red-200' : 'bg-gray-100'
          }`}
        />

        {/* 마이크 버튼 */}
        {isSupported && (
          <button
            onClick={toggleListening}
            disabled={disabled}
            className={`p-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isActive
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
            } ${voiceState === 'speaking' ? 'animate-pulse' : ''}`}
            aria-label={isActive ? 'Stop voice input' : 'Start voice input'}
          >
            {isActive ? (
              // 음성 활성화 상태: 정지 아이콘 또는 파동 아이콘
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                {voiceState === 'speaking' ? (
                  // 음성 입력 중: 파동 아이콘
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1 1.93c-3.94-.49-7-3.85-7-7.93h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2c0 4.08-3.06 7.44-7 7.93V19h4v2H8v-2h4v-3.07z" />
                ) : (
                  // 음성 대기 중: 마이크 아이콘
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.91-3h2.09c0 3.41-2.72 6.23-6 6.72V21h-4v-3.28c-3.28-.49-6-3.31-6-6.72h2.09c0 2.76 2.24 5 5 5s5-2.24 5-5z" />
                )}
              </svg>
            ) : (
              // 비활성화 상태: 마이크 아이콘
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            )}
          </button>
        )}

        {/* 전송 버튼 */}
        <button
          onClick={onSend}
          disabled={!value.trim() || disabled || isActive}
          className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        </button>
      </div>

      {/* 음성 인식 상태 표시 */}
      {isActive && (
        <div className="mt-2 text-center">
          <span
            className={`text-xs ${voiceState === 'speaking' ? 'text-red-600' : 'text-gray-500'}`}
          >
            {voiceState === 'speaking'
              ? '🎤 음성 입력 중...'
              : '⏳ 음성 대기 중... (5초 후 자동 종료)'}
          </span>
        </div>
      )}
    </div>
  );
}
