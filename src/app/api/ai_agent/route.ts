/**
 * AI Agent API
 * 버전: v7.8 (세션별 대화 히스토리 + Human-in-the-Loop)
 *
 * POST /api/ai_agent - AI Agent와 대화
 * - AWS Lightsail의 AI Agent 서버 연동
 * - 세션 기반 대화 히스토리
 * - Human-in-the-Loop 승인 플로우
 */

import { NextRequest, NextResponse } from 'next/server';
import type { AIAgentRequest, AIAgentResponse } from '@/types/ai-agent';

export const runtime = 'nodejs';

// CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// AI Agent 서버 응답 타입 (snake_case)
interface AIAgentServerResponse {
  status: 'waiting' | 'complete' | 'clarification' | 'error';
  message: string;
  session_id?: string | null;
  confidence?: number | null;
  approval_needed: boolean;
  api_calls: number;
  execution_plan?: Array<{
    tool: string;
    args: Record<string, unknown>;
  }> | null;
}

const AI_AGENT_URL = process.env.AI_AGENT_URL || 'http://44.244.60.255:8000';
// const AI_AGENT_URL = process.env.AI_AGENT_URL_DEV;

/**
 * OPTIONS 요청 처리 (CORS preflight)
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * AI Agent 챗봇 엔드포인트
 *
 * @route POST /api/ai_agent
 * @body { query: string, session_id?: string, user_feedback?: string }
 * @returns { success: boolean, data?: AIAgentResponse, message?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body: AIAgentRequest = await request.json();
    const { query, session_id, user_feedback } = body;

    // 입력 검증
    if (!query && !user_feedback) {
      return NextResponse.json(
        {
          success: false,
          message: 'query 또는 user_feedback이 필요합니다',
        },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log(`[AI Agent] 요청:`, {
      query: query || '(user_feedback)',
      session_id,
      user_feedback,
    });

    // AI Agent 서버 호출 (30초 타임아웃)
    const aiResponse = await fetch(`${AI_AGENT_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query || '',
        session_id: session_id || null,
        user_feedback: user_feedback || null,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error(`[AI Agent] HTTP ${aiResponse.status}:`, errorText);
      return NextResponse.json(
        { success: false, message: `AI Agent 오류: ${aiResponse.status}` },
        { status: 502, headers: corsHeaders }
      );
    }

    const data: AIAgentServerResponse = await aiResponse.json();

    console.log(`[AI Agent] 응답:`, {
      status: data.status,
      confidence: data.confidence,
      approval_needed: data.approval_needed,
      api_calls: data.api_calls,
    });

    // 응답 변환 (snake_case → camelCase)
    const response: AIAgentResponse = {
      status: data.status,
      message: data.message,
      session_id: data.session_id,
      confidence: data.confidence,
      approval_needed: data.approval_needed,
      api_calls: data.api_calls,
      execution_plan: data.execution_plan,
    };

    return NextResponse.json(
      { success: true, data: response },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[AI Agent] API 오류:', error);

    // 타임아웃 에러 처리
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { success: false, message: '요청 시간이 초과되었습니다 (30초)' },
        { status: 504, headers: corsHeaders }
      );
    }

    const message = error instanceof Error ? error.message : 'AI Agent 호출 실패';
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}
