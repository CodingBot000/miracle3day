/**
 * AI Agent API
 *
 * POST /api/ai_agent - AI Agent와 대화
 * - AWS Lightsail의 AI Agent 서버 연동
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

interface AIAgentRequest {
  query: string;
}

interface AIAgentServerResponse {
  answer: string;
  complexity: string;
  api_calls: number;
  iteration: number;
}

const AI_AGENT_URL = process.env.AI_AGENT_URL || 'http://44.244.60.255:8000';

/**
 * AI Agent 쿼리 요청
 */
export async function POST(request: NextRequest) {
  try {
    const body: AIAgentRequest = await request.json();

    if (!body.query || typeof body.query !== 'string') {
      return NextResponse.json(
        { success: false, message: 'query 필드가 필요합니다' },
        { status: 400 }
      );
    }

    // AI Agent 서버 호출 (30초 타임아웃)
    const aiResponse = await fetch(`${AI_AGENT_URL}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: body.query,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI Agent 응답 오류:', aiResponse.status, errorText);
      return NextResponse.json(
        { success: false, message: `AI Agent 오류: ${aiResponse.status}` },
        { status: 502 }
      );
    }

    const data: AIAgentServerResponse = await aiResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        answer: data.answer,
        complexity: data.complexity,
        apiCalls: data.api_calls,
        iteration: data.iteration,
      },
    });
  } catch (error) {
    console.error('AI Agent API 오류:', error);

    // 타임아웃 에러 처리
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        { success: false, message: '요청 시간이 초과되었습니다 (30초)' },
        { status: 504 }
      );
    }

    const message = error instanceof Error ? error.message : 'AI Agent 호출 실패';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
