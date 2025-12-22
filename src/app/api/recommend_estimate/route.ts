import { NextRequest, NextResponse } from 'next/server';
import { recommendTreatments, RecommendInputs } from '@/app/[locale]/(consult)/recommend_estimate/SkinSurveyFlow/questionnaire/questionScript/matching';
import { log } from '@/utils/logger';

/**
 * 시술 추천 알고리즘 API
 *
 * 이 API는 서버 사이드에서만 실행되므로,
 * 매칭 알고리즘과 가격 정보가 클라이언트에 노출되지 않습니다.
 *
 * @route POST /api/recommend_estimate
 */
export async function POST(request: NextRequest) {
  try {
    // 요청 본문에서 입력 데이터 파싱
    const input: RecommendInputs = await request.json();

    log.debug('[API] /api/recommend_estimate - Request received');
    log.debug('[API] Input:', input);

    // 입력 데이터 유효성 검사
    if (!input || typeof input !== 'object') {
      log.error('[API] Invalid input: not an object');
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      );
    }

    // 필수 필드 검증
    const requiredFields = [
      'skinConcerns',
      'treatmentGoals',
      'treatmentAreas',
      'budgetRangeId',
      'priorityId',
      'pastTreatments',
      'medicalConditions'
    ];

    for (const field of requiredFields) {
      if (!(field in input)) {
        log.error(`[API] Missing required field: ${field}`);
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // 추천 알고리즘 실행 (서버 사이드에서만 실행됨)
    const output = recommendTreatments(input);

    log.debug('[API] Recommendation generated successfully');
    log.debug('[API] Recommendations count:', output.recommendations.length);
    log.debug('[API] Total KRW:', output.totalPriceKRW);

    // 결과 반환
    return NextResponse.json(output, { status: 200 });

  } catch (error) {
    log.error('[API] Error in /api/recommend_estimate:', error);

    // 에러 상세 정보 (프로덕션에서는 일반 메시지로 대체)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to generate recommendations',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET 요청 핸들러 (헬스체크용)
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/recommend_estimate',
    method: 'POST'
  });
}
