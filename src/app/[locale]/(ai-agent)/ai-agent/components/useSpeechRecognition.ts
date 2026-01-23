'use client';

import { useRef, useEffect, useState, useCallback } from 'react';

// Web Speech API 타입 정의
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onend: (() => void) | null;
  onspeechstart: (() => void) | null;
  onspeechend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export type VoiceState = 'idle' | 'listening' | 'speaking';

interface UseSpeechRecognitionOptions {
  /** 현재 입력 값 (음성 인식 시작 시 유지) */
  initialValue?: string;
  /** 무음 타임아웃 (ms) - 기본값 5000ms */
  silenceTimeout?: number;
  /** 음성 인식 언어 - 기본값 'ko-KR' */
  lang?: string;
  /** 텍스트 변경 콜백 */
  onTranscriptChange?: (text: string) => void;
  /** 음성 인식 완료 후 전송 콜백 */
  onComplete?: (text: string) => void;
}

interface UseSpeechRecognitionReturn {
  /** 현재 음성 인식 상태 */
  voiceState: VoiceState;
  /** 음성 인식 지원 여부 */
  isSupported: boolean;
  /** 음성 인식 활성화 여부 */
  isActive: boolean;
  /** 음성 인식 시작 */
  startListening: () => Promise<void>;
  /** 음성 인식 중지 */
  stopListening: () => void;
  /** 마이크 버튼 클릭 핸들러 (토글) */
  toggleListening: () => void;
}

const DEFAULT_SILENCE_TIMEOUT = 5000;
const DEFAULT_LANG = 'ko-KR';

export function useSpeechRecognition(
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn {
  const {
    initialValue = '',
    silenceTimeout = DEFAULT_SILENCE_TIMEOUT,
    lang = DEFAULT_LANG,
    onTranscriptChange,
    onComplete,
  } = options;

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingTextRef = useRef<string>('');

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isSupported, setIsSupported] = useState(true);

  // 음성 인식 지원 여부 확인
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsSupported(false);
      return;
    }
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
    }
  }, []);

  // 무음 타이머 시작
  const startSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }

    silenceTimerRef.current = setTimeout(() => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    }, silenceTimeout);
  }, [silenceTimeout]);

  // 무음 타이머 정지
  const stopSilenceTimer = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  // 음성 인식 종료 처리
  const handleRecognitionEnd = useCallback(() => {
    stopSilenceTimer();
    setVoiceState('idle');

    const finalText = pendingTextRef.current.trim();
    if (finalText && onComplete) {
      onComplete(finalText);
    }
    pendingTextRef.current = '';
  }, [stopSilenceTimer, onComplete]);

  // 음성 인식 시작
  const startListening = useCallback(async () => {
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    try {
      // 마이크 권한 요청
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // 현재 인식된 텍스트 업데이트
        const currentText = pendingTextRef.current + finalTranscript;
        pendingTextRef.current = currentText;

        if (onTranscriptChange) {
          onTranscriptChange(currentText + interimTranscript);
        }
      };

      recognition.onspeechstart = () => {
        setVoiceState('speaking');
        stopSilenceTimer();
      };

      recognition.onspeechend = () => {
        setVoiceState('listening');
        startSilenceTimer();
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert(
            '마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.'
          );
        }
        handleRecognitionEnd();
      };

      recognition.onend = () => {
        handleRecognitionEnd();
      };

      recognitionRef.current = recognition;
      pendingTextRef.current = initialValue;
      recognition.start();
      setVoiceState('listening');
      startSilenceTimer();
    } catch (error) {
      console.error('Microphone permission error:', error);
      alert(
        '마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.'
      );
    }
  }, [
    initialValue,
    lang,
    onTranscriptChange,
    startSilenceTimer,
    stopSilenceTimer,
    handleRecognitionEnd,
  ]);

  // 음성 인식 중지
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  // 토글 핸들러
  const toggleListening = useCallback(() => {
    if (voiceState === 'idle') {
      startListening();
    } else {
      stopListening();
    }
  }, [voiceState, startListening, stopListening]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      stopSilenceTimer();
    };
  }, [stopSilenceTimer]);

  return {
    voiceState,
    isSupported,
    isActive: voiceState !== 'idle',
    startListening,
    stopListening,
    toggleListening,
  };
}
