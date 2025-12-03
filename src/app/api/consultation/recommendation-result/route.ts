import { NextRequest, NextResponse } from 'next/server';
import { q } from '@/lib/db';
import { getUserAPIServer } from '@/app/api/auth/getUser/getUser.server';
import { log } from '@/utils/logger';

interface SaveRecommendationResultRequest {
  idUuidConsultSubmissions: string;
  recommendationOutput: Record<string, any>;
  formData?: Record<string, any>;
  sessionId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: SaveRecommendationResultRequest = await request.json();

    // 필수 필드 검증
    if (!data.idUuidConsultSubmissions) {
      return NextResponse.json(
        { success: false, error: 'idUuidConsultSubmissions is required' },
        { status: 400 }
      );
    }

    if (!data.recommendationOutput) {
      return NextResponse.json(
        { success: false, error: 'recommendationOutput is required' },
        { status: 400 }
      );
    }

    // 로그인 사용자 확인 (optional)
    let idUuidMember: string | null = null;
    try {
      const userResult = await getUserAPIServer();
      if (userResult?.userInfo?.id_uuid) {
        idUuidMember = userResult.userInfo.id_uuid;
      }
    } catch (error) {
      // 비로그인 사용자는 null로 진행
      log.debug('User not logged in or session check failed:', error);
    }

    // 메타 정보 수집
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] ||
                      request.headers.get('x-real-ip') ||
                      null;
    const userAgent = request.headers.get('user-agent') || null;

    // DB에 삽입
    const sql = `
      INSERT INTO analysis_recommendation_results (
        id_uuid_member,
        id_uuid_consult_submissions,
        recommendation_output,
        form_data,
        session_id,
        ip_address,
        user_agent,
        created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6::inet, $7, NOW()
      )
      RETURNING id
    `;

    const params = [
      idUuidMember,
      data.idUuidConsultSubmissions,
      JSON.stringify(data.recommendationOutput),
      data.formData ? JSON.stringify(data.formData) : null,
      data.sessionId || null,
      ipAddress,
      userAgent,
    ];

    log.debug('=== Saving Recommendation Result ===');
    log.debug('idUuidMember:', idUuidMember);
    log.debug('idUuidConsultSubmissions:', data.idUuidConsultSubmissions);
    log.debug('sessionId:', data.sessionId);
    log.debug('=====================================');

    const result = await q(sql, params);

    if (!result || result.length === 0) {
      console.error('Database error: No result returned');
      return NextResponse.json(
        { success: false, error: 'Failed to save recommendation result' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: result[0].id,
    });

  } catch (error: any) {
    console.error('POST /api/consultation/recommendation-result error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
