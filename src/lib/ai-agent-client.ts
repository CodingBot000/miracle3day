/**
 * AI Agent 클라이언트 (Hybrid Architecture)
 *
 * Version: v2.0 (2026-01-29)
 *
 * Architecture:
 * - Version API: Next.js API Route (/api/ai_agent/version) - Fast, <1s
 * - Chat API: FastAPI Direct (https://api.mimotok.com/chat) - 180s timeout
 *
 * Why Hybrid?
 * - Vercel Hobby Plan: 10s timeout (Serverless Functions)
 * - AI Agent average response: 15-30s
 * - Solution: Chat bypasses Next.js proxy, Version uses proxy
 *
 * Changes from v1.0:
 * - Removed APIResponse<T> wrapper
 * - Direct AIAgentResponse return
 * - Separate URLs for chat vs version
 * - 180s timeout for chat
 */

import type {
  AIAgentRequest,
  AIAgentResponse,
  AIAgentClientConfig,
} from '@/types/ai-agent';

export class AIAgentClient {
  private chatBaseURL: string;    // FastAPI direct
  private versionBaseURL: string; // Next.js API Route
  private timeout: number;

  constructor(config?: AIAgentClientConfig) {
    // Chat: FastAPI direct (180s timeout)
    this.chatBaseURL =
      process.env.NEXT_PUBLIC_AI_AGENT_URL ||
      'https://api.mimotok.com';

    // Version: API Route (fast)
    this.versionBaseURL = '/api/ai_agent/version';

    this.timeout = config?.timeout || 180000; // 180s for chat
  }

  /**
   * 새로운 질문 전송 (FastAPI 직접 호출)
   */
  async sendMessage(
    query: string,
    sessionId?: string
  ): Promise<AIAgentResponse> {
    try {
      const response = await fetch(`${this.chatBaseURL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          session_id: sessionId || null,
        } as AIAgentRequest),
        signal: AbortSignal.timeout(this.timeout),
      });

      // HTTP 에러 처리
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // ChatResponse (camelCase) 직접 반환
      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        // 타임아웃 에러를 AIAgentResponse 형식으로 변환
        return {
          status: 'error',
          message: '응답 시간 초과 (3분)',
          approval_needed: false,
          api_calls: 0,
        };
      }

      // 네트워크 에러를 AIAgentResponse 형식으로 변환
      return {
        status: 'error',
        message: error instanceof Error ? error.message : '네트워크 오류',
        approval_needed: false,
        api_calls: 0,
      };
    }
  }

  /**
   * Human-in-the-Loop 피드백 전송 (FastAPI 직접 호출)
   */
  async sendFeedback(
    sessionId: string,
    feedback: 'ok' | 'cancel' | 'modify',
    query?: string
  ): Promise<AIAgentResponse> {
    try {
      const response = await fetch(`${this.chatBaseURL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query || '',
          session_id: sessionId,
          user_feedback: feedback,
        } as AIAgentRequest),
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        return {
          status: 'error',
          message: '응답 시간 초과 (3분)',
          approval_needed: false,
          api_calls: 0,
        };
      }

      return {
        status: 'error',
        message: error instanceof Error ? error.message : '네트워크 오류',
        approval_needed: false,
        api_calls: 0,
      };
    }
  }

  /**
   * AI Agent 버전 정보 가져오기 (API Route 유지)
   */
  async getVersion(): Promise<{ version?: string; status?: string; error?: boolean; httpStatus?: number; isTimeout?: boolean }> {
    try {
      // Next.js API route를 통해 백엔드 root endpoint 호출
      const response = await fetch(this.versionBaseURL, {
        method: 'GET',
        signal: AbortSignal.timeout(5000), // 5초 timeout
      });

      if (!response.ok) {
        return {
          error: true,
          httpStatus: response.status,
        };
      }

      const data = await response.json();
      return {
        version: data.version || 'unknown',
        status: data.status || 'ok',
      };
    } catch (error) {
      console.error('Failed to fetch AI Agent version:', error);

      // 타임아웃 에러 확인
      const isTimeout = error instanceof Error &&
        (error.name === 'TimeoutError' || error.name === 'AbortError');

      return {
        error: true,
        isTimeout,
      };
    }
  }
}

// 싱글톤 인스턴스
export const aiAgentClient = new AIAgentClient();
