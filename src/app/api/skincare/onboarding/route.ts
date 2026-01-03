/**
 * 스킨케어 온보딩 API 라우트
 *
 * POST /api/skincare/onboarding - 데이터 저장
 * - JWT 토큰에서 사용자 ID 추출 (클라이언트에서 보내지 않음)
 */

import { NextRequest, NextResponse } from 'next/server';
import { one } from '@/lib/db';
import { verifyAccessToken, ACCESS_TOKEN_COOKIE } from '@/lib/auth/jwt';

export const runtime = 'nodejs';

/**
 * 온보딩 데이터 저장
 */
export async function POST(request: NextRequest) {
  try {
    // 1. JWT 토큰에서 user_id 추출
    const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - Please login first' },
        { status: 401 }
      );
    }

    const payload = await verifyAccessToken(token);

    if (!payload || payload.status !== 'active') {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const id_uuid = payload.sub; // JWT에서 추출한 사용자 ID

    // 2. 요청 본문에서 온보딩 데이터 추출
    const body = await request.json();
    const {
      fitzpatrick_type,
      fitzpatrick_rgb,
      age_group,
      gender,
      country_code,
      region,
      city,
      skin_type,
      skin_concerns,
      current_products,
      daily_routine_time,
      primary_goal,
      interested_ingredients,
      product_preferences,
      sleep_pattern,
      work_environment,
      exercise_frequency,
      monthly_budget,
    } = body;

    // UPSERT: 기존 데이터가 있으면 업데이트, 없으면 삽입
    const result = await one(
      `INSERT INTO skincare_onboarding (
        id_uuid,
        fitzpatrick_type,
        fitzpatrick_rgb,
        age_group,
        gender,
        country_code,
        region,
        city,
        skin_type,
        skin_concerns,
        current_products,
        daily_routine_time,
        primary_goal,
        interested_ingredients,
        product_preferences,
        sleep_pattern,
        work_environment,
        exercise_frequency,
        monthly_budget,
        onboarding_completed,
        onboarding_step,
        created_at,
        updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, true, 18, NOW(), NOW()
      )
      ON CONFLICT (id_uuid)
      DO UPDATE SET
        fitzpatrick_type = EXCLUDED.fitzpatrick_type,
        fitzpatrick_rgb = EXCLUDED.fitzpatrick_rgb,
        age_group = EXCLUDED.age_group,
        gender = EXCLUDED.gender,
        country_code = EXCLUDED.country_code,
        region = EXCLUDED.region,
        city = EXCLUDED.city,
        skin_type = EXCLUDED.skin_type,
        skin_concerns = EXCLUDED.skin_concerns,
        current_products = EXCLUDED.current_products,
        daily_routine_time = EXCLUDED.daily_routine_time,
        primary_goal = EXCLUDED.primary_goal,
        interested_ingredients = EXCLUDED.interested_ingredients,
        product_preferences = EXCLUDED.product_preferences,
        sleep_pattern = EXCLUDED.sleep_pattern,
        work_environment = EXCLUDED.work_environment,
        exercise_frequency = EXCLUDED.exercise_frequency,
        monthly_budget = EXCLUDED.monthly_budget,
        onboarding_completed = true,
        onboarding_step = 18,
        updated_at = NOW()
      RETURNING *`,
      [
        id_uuid,
        fitzpatrick_type || null,
        fitzpatrick_rgb || null,
        age_group || null,
        gender || null,
        country_code || null,
        region || null,
        city || null,
        skin_type || null,
        skin_concerns || null,
        current_products || null,
        daily_routine_time || null,
        primary_goal || null,
        interested_ingredients || null,
        product_preferences || null,
        sleep_pattern || null,
        work_environment || null,
        exercise_frequency || null,
        monthly_budget || null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: '온보딩이 완료되었습니다',
      data: result,
    });
  } catch (error) {
    console.error('온보딩 저장 오류:', error);
    const message = error instanceof Error ? error.message : '저장 실패';
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
