import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { q } from '@/lib/db';
import { TABLE_PUSH_FCM_TOKENS } from '@/constants/tables';

const updateLanguageSchema = z.object({
  fcmToken: z.string().min(1),
  preferredLanguage: z.enum(['en', 'ko', 'ja', 'zh']),
});

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data = updateLanguageSchema.parse(body);

    await q(
      `UPDATE ${TABLE_PUSH_FCM_TOKENS}
       SET preferred_language = $1,
           updated_at = NOW()
       WHERE fcm_token = $2`,
      [data.preferredLanguage, data.fcmToken]
    );

    return NextResponse.json({
      success: true,
      message: 'Language updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[FCM Update Language Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
