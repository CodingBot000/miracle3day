import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

/**
 * 오늘 날짜의 루틴 진행 상태 조회 API
 *
 * GET /api/skincare/progress/today?id_uuid_member=xxx&routine_uuid=yyy&date=2025-01-07
 *
 * Query Parameters:
 * - id_uuid_member: 사용자 UUID (필수)
 * - routine_uuid: 루틴 UUID (필수)
 * - date: 조회할 날짜 YYYY-MM-DD (선택, 기본값: 오늘)
 *
 * 응답:
 * {
 *   "success": true,
 *   "date": "2025-01-07",
 *   "checked_steps": ["uuid-abc", "uuid-def"],  // completed=true인 step_uuid 배열
 *   "server_date": "2025-01-07"  // 서버 날짜도 함께 반환 (날짜 검증용)
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const idUuidMember = searchParams.get('id_uuid_member');
    const routineUuid = searchParams.get('routine_uuid');
    const requestedDate = searchParams.get('date');

    if (!idUuidMember || !routineUuid) {
      return NextResponse.json(
        {
          success: false,
          error: 'id_uuid_member and routine_uuid are required',
        },
        { status: 400 }
      );
    }

    // 서버 시간 기준 오늘 날짜
    const now = new Date();
    const serverDate = now.toISOString().split('T')[0];

    // 요청된 날짜 또는 오늘 날짜 사용
    const targetDate = requestedDate || serverDate;

    // DB에서 해당 날짜의 완료된 스텝 조회
    const result = await query<{ step_uuid: string }>(
      `
      SELECT step_uuid
      FROM skincare_routine_progress
      WHERE id_uuid_member = $1
        AND routine_uuid = $2
        AND completion_date = $3
        AND completed = true
      `,
      [idUuidMember, routineUuid, targetDate]
    );

    const checkedSteps = result.rows.map((row) => row.step_uuid);

    console.log('[DEBUG] 📥 Today progress fetched:', {
      idUuidMember,
      routineUuid,
      targetDate,
      checkedStepsCount: checkedSteps.length,
    });

    return NextResponse.json({
      success: true,
      date: targetDate,
      checked_steps: checkedSteps,
      server_date: serverDate,
    });
  } catch (error) {
    console.error('[DEBUG] ❌ Today progress error:', error);
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
