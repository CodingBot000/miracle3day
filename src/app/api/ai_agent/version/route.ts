/**
 * AI Agent Version API
 * 백엔드 서버의 버전 정보를 가져옵니다.
 *
 * GET /api/ai_agent/version - AI Agent 버전 정보
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

// CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const AI_AGENT_URL = process.env.AI_AGENT_URL || 'http://44.244.60.255:8000';

/**
 * OPTIONS 요청 처리 (CORS preflight)
 */
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * AI Agent 버전 정보 엔드포인트
 *
 * @route GET /api/ai_agent/version
 * @returns { status: string, version: string, hitl_enabled: boolean }
 */
export async function GET() {
  try {
    // AI Agent 서버 root endpoint 호출 (5초 타임아웃)
    const response = await fetch(`${AI_AGENT_URL}/`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error(`[AI Agent Version] HTTP ${response.status}`);
      return NextResponse.json(
        {
          status: 'error',
          version: 'unknown',
          message: `Failed to fetch version: ${response.status}`
        },
        { status: 502, headers: corsHeaders }
      );
    }

    const data = await response.json();

    console.log('[AI Agent Version] 버전 정보:', {
      status: data.status,
      version: data.version,
      hitl_enabled: data.hitl_enabled,
    });

    return NextResponse.json(
      {
        status: data.status || 'ok',
        version: data.version || 'unknown',
        hitl_enabled: data.hitl_enabled !== undefined ? data.hitl_enabled : true,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('[AI Agent Version] API 오류:', error);

    // 타임아웃 에러 처리
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json(
        {
          status: 'error',
          version: 'unknown',
          message: 'Request timeout (5초)'
        },
        { status: 504, headers: corsHeaders }
      );
    }

    const message = error instanceof Error ? error.message : 'Failed to fetch version';
    return NextResponse.json(
      {
        status: 'error',
        version: 'unknown',
        message
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
