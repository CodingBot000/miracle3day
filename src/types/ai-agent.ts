/**
 * AI Agent API 타입 정의
 * 버전: v7.8 (세션별 대화 히스토리 + Human-in-the-Loop)
 * 백엔드: AI_AGENT_URL/chat
 */

// ============================================
// API 요청/응답 타입
// ============================================

/**
 * AI Agent 요청 타입
 */
export interface AIAgentRequest {
  query: string;
  session_id?: string | null;
  user_feedback?: 'ok' | 'cancel' | 'modify' | null;
}

/**
 * AI Agent 응답 상태
 * - waiting: 사용자 확인 대기 중
 * - complete: 처리 완료
 * - clarification: 추가 정보 필요
 * - error: 오류 발생
 */
export type AIAgentStatus = 'waiting' | 'complete' | 'clarification' | 'error';

/**
 * 실행 계획 아이템
 */
export interface ExecutionPlanItem {
  tool: string;
  args: Record<string, unknown>;
}

/**
 * AI Agent 응답 타입
 */
export interface AIAgentResponse {
  status: AIAgentStatus;
  message: string;
  session_id?: string | null;
  confidence?: number | null;
  approval_needed: boolean;
  api_calls: number;
  execution_plan?: ExecutionPlanItem[] | null;
}

// ============================================
// 프론트엔드 UI 타입
// ============================================

/**
 * 대화 메시지 역할
 */
export type MessageRole = 'user' | 'assistant' | 'system';

/**
 * 대화 메시지 메타데이터
 */
export interface MessageMetadata {
  status?: AIAgentStatus;
  confidence?: number;
  apiCalls?: number;
  executionPlan?: ExecutionPlanItem[];
}

/**
 * 대화 메시지
 */
export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: MessageMetadata;
}

/**
 * UI 텍스트 (다국어)
 */
export interface UITexts {
  title: string;
  subtitle: string;
  placeholder: string;
  send: string;
  typing: string;
  greeting: string;
  suggestions: string[];
  error: string;
  // v7.8 추가
  approvalTitle?: string;
  approvalConfirm?: string;
  approvalCancel?: string;
  approvalModify?: string;
  clarificationHint?: string;
}

// ============================================
// API 클라이언트 타입
// ============================================

/**
 * API 응답 래퍼
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

/**
 * AI Agent 클라이언트 설정
 */
export interface AIAgentClientConfig {
  baseURL?: string;
  timeout?: number;
}
