/**
 * AI Agent 클라이언트
 * Next.js API 라우트를 통해 AI Agent와 통신
 */

import type {
  AIAgentRequest,
  AIAgentResponse,
  APIResponse,
  AIAgentClientConfig,
} from '@/types/ai-agent';

export class AIAgentClient {
  private baseURL: string;
  private timeout: number;

  constructor(config?: AIAgentClientConfig) {
    this.baseURL = config?.baseURL || '/api/ai_agent';
    this.timeout = config?.timeout || 30000;
  }

  /**
   * 새로운 질문 전송
   */
  async sendMessage(
    query: string,
    sessionId?: string
  ): Promise<APIResponse<AIAgentResponse>> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          session_id: sessionId || null,
        } as AIAgentRequest),
        signal: AbortSignal.timeout(this.timeout),
      });

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        return {
          success: false,
          message: '응답 시간 초과',
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : '네트워크 오류',
      };
    }
  }

  /**
   * Human-in-the-Loop 피드백 전송
   */
  async sendFeedback(
    sessionId: string,
    feedback: 'ok' | 'cancel' | 'modify',
    query?: string
  ): Promise<APIResponse<AIAgentResponse>> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query || '',
          session_id: sessionId,
          user_feedback: feedback,
        } as AIAgentRequest),
        signal: AbortSignal.timeout(this.timeout),
      });

      return await response.json();
    } catch (error) {
      if (error instanceof Error && error.name === 'TimeoutError') {
        return {
          success: false,
          message: '응답 시간 초과',
        };
      }

      return {
        success: false,
        message: error instanceof Error ? error.message : '네트워크 오류',
      };
    }
  }
}

// 싱글톤 인스턴스
export const aiAgentClient = new AIAgentClient();
