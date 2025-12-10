import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { q } from '@/lib/db';
import { TABLE_PUSH_FCM_TOKENS } from '@/constants/tables';

// Zod 스키마
const registerSchema = z.object({
  fcmToken: z.string().min(1, 'FCM token is required'),
  deviceId: z.string().min(1, 'Device ID is required'),
  platform: z.enum(['android', 'ios']),
  preferredLanguage: z.string().default('en'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    // 중복 확인 및 업데이트
    const existing = await q(
      `SELECT id FROM ${TABLE_PUSH_FCM_TOKENS}
       WHERE fcm_token = $1`,
      [data.fcmToken]
    );

    if (existing.length > 0) {
      // 기존 토큰 업데이트
      await q(
        `UPDATE ${TABLE_PUSH_FCM_TOKENS}
         SET device_id = $1,
             platform = $2,
             preferred_language = $3,
             updated_at = NOW(),
             last_active_at = NOW(),
             is_active = true
         WHERE fcm_token = $4`,
        [data.deviceId, data.platform, data.preferredLanguage, data.fcmToken]
      );
    } else {
      // 신규 토큰 등록
      await q(
        `INSERT INTO ${TABLE_PUSH_FCM_TOKENS}
         (fcm_token, device_id, platform, preferred_language, created_at, updated_at, last_active_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW(), NOW())`,
        [data.fcmToken, data.deviceId, data.platform, data.preferredLanguage]
      );
    }

    return NextResponse.json(
      { success: true, message: 'Token registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[FCM Register Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
