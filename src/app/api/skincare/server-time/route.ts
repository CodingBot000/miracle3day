import { NextResponse } from 'next/server';

/**
 * 서버 시간 API
 *
 * GET /api/skincare/server-time
 *
 * 응답:
 * {
 *   "server_date": "2025-01-07",
 *   "server_timestamp": "2025-01-07T15:30:00.000Z"
 * }
 *
 * 사용 목적:
 * - 디바이스 시간 조작 방지
 * - 날짜 변경 감지에 서버 시간 사용
 */
export async function GET() {
  try {
    const now = new Date();

    // UTC 기준 ISO 문자열
    const serverTimestamp = now.toISOString();

    // YYYY-MM-DD 형식 (UTC 기준)
    // 참고: 필요시 사용자 타임존을 고려하여 변경 가능
    const serverDate = serverTimestamp.split('T')[0];

    return NextResponse.json({
      server_date: serverDate,
      server_timestamp: serverTimestamp,
    });
  } catch (error) {
    console.error('[DEBUG] ❌ Server time error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
