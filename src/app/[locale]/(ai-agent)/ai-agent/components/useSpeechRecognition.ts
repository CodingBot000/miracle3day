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

// 디버깅 로그 (개발 시에만 true로 설정)
const DEBUG = false;
const log = (...args: unknown[]) => {
  if (DEBUG) {
    console.log('[SpeechRecognition]', ...args);
  }
};

// 모바일 감지
const isMobile = () => {
  if (typeof window === 'undefined') return false;
  const result = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  log('isMobile check:', result, 'userAgent:', navigator.userAgent);
  return result;
};

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
  const lastInterimRef = useRef<string>(''); // 마지막 interim 결과 저장 (모바일용)
  const lastSpeechTimeRef = useRef<number>(Date.now());

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [isSupported, setIsSupported] = useState(true);

  // 음성 인식 지원 여부 확인
  useEffect(() => {
    if (typeof window === 'undefined') {
      log('SSR environment - not supported');
      setIsSupported(false);
      return;
    }
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    log('SpeechRecognition API:', SpeechRecognitionAPI ? 'supported' : 'NOT supported');
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
    log('handleRecognitionEnd called');
    log('  pendingText:', pendingTextRef.current);
    log('  lastInterim:', lastInterimRef.current);

    stopSilenceTimer();
    setVoiceState('idle');

    // 최종 텍스트 결정: pending 결과가 없으면 마지막 interim 결과 사용 (모바일 대응)
    let finalText = pendingTextRef.current.trim();
    if (!finalText && lastInterimRef.current) {
      log('  Using lastInterim as final (no pending)');
      finalText = lastInterimRef.current.trim();
    }

    log('  finalText to send:', finalText);
    if (finalText && onComplete) {
      log('  Calling onComplete');
      onComplete(finalText);
    }
    pendingTextRef.current = '';
    lastInterimRef.current = '';
  }, [stopSilenceTimer, onComplete]);

  // 음성 인식 시작
  const startListening = useCallback(async () => {
    log('startListening called');

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      log('SpeechRecognition API not available');
      alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
      return;
    }

    try {
      // 마이크 권한 요청 (권한만 확인하고 스트림은 바로 해제)
      log('Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // 스트림 트랙 해제 - SpeechRecognition이 마이크에 접근할 수 있도록
      stream.getTracks().forEach(track => track.stop());
      log('Microphone permission granted, stream released');

      const recognition = new SpeechRecognitionAPI();
      const mobile = isMobile();

      // 모바일: continuous=false (한 번의 발화 후 종료)
      // PC: continuous=true (연속 발화 가능)
      recognition.continuous = !mobile;
      recognition.interimResults = true;
      recognition.lang = lang;

      log('Recognition config:', {
        continuous: recognition.continuous,
        interimResults: recognition.interimResults,
        lang: recognition.lang,
        isMobile: mobile,
      });

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        log('onresult event fired');
        log('  resultIndex:', event.resultIndex);
        log('  results.length:', event.results.length);

        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const isFinal = event.results[i].isFinal;
          log(`  result[${i}]: isFinal=${isFinal}, transcript="${transcript}"`);

          if (isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        log('  finalTranscript:', finalTranscript);
        log('  interimTranscript:', interimTranscript);

        // final result가 있으면 마지막 발화 시간 업데이트 및 타이머 재시작
        if (finalTranscript) {
          lastSpeechTimeRef.current = Date.now();

          // 모바일: 각 결과가 전체 문장을 포함하므로 replace
          // PC: 결과가 부분적이므로 append
          const currentText = mobile ? finalTranscript : pendingTextRef.current + finalTranscript;
          pendingTextRef.current = currentText;
          log('  Updated pendingText:', currentText, '(mobile:', mobile, ')');

          // 발화 후 5초 타이머 재시작
          stopSilenceTimer();
          startSilenceTimer();

          if (onTranscriptChange) {
            log('  Calling onTranscriptChange with:', currentText + interimTranscript);
            onTranscriptChange(currentText + interimTranscript);
          }
        } else if (interimTranscript) {
          // interim result만 있는 경우 (발화 중)
          // 모바일: replace, PC: append
          const currentText = mobile ? interimTranscript : pendingTextRef.current + interimTranscript;
          lastInterimRef.current = currentText;
          log('  Updated lastInterim:', currentText, '(mobile:', mobile, ')');
          if (onTranscriptChange) {
            log('  Calling onTranscriptChange (interim):', currentText);
            onTranscriptChange(currentText);
          }
        }
      };

      recognition.onspeechstart = () => {
        log('onspeechstart fired');
        setVoiceState('speaking');
        stopSilenceTimer();
      };

      recognition.onspeechend = () => {
        log('onspeechend fired');
        log('  Current pendingText:', pendingTextRef.current);
        log('  Current lastInterim:', lastInterimRef.current);

        setVoiceState('listening');
        if (mobile) {
          // 모바일에서는 speechend 후 약간의 지연을 두고 종료
          // (final result가 도착할 시간 확보)
          log('  Mobile: waiting 500ms before stop');
          setTimeout(() => {
            log('  Mobile: 500ms passed, stopping recognition');
            if (recognitionRef.current) {
              recognition.stop();
            }
          }, 500);
        } else {
          // PC에서는 5초 타이머 시작
          log('  PC: starting silence timer');
          startSilenceTimer();
        }
      };

      recognition.onerror = (event) => {
        log('onerror fired:', event.error);
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          alert(
            '마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.'
          );
        }
        handleRecognitionEnd();
      };

      recognition.onend = () => {
        log('onend fired');
        handleRecognitionEnd();
      };

      recognitionRef.current = recognition;
      pendingTextRef.current = initialValue;
      log('Calling recognition.start()');
      recognition.start();
      log('recognition.start() called successfully');
      setVoiceState('listening');
      startSilenceTimer();
    } catch (error) {
      log('Error in startListening:', error);
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
