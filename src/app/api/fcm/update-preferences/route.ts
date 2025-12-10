import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { q } from '@/lib/db';
import { TABLE_PUSH_FCM_TOKENS } from '@/constants/tables';

const updatePreferencesSchema = z.object({
  fcmToken: z.string().min(1),
  allowGeneral: z.boolean(),
  allowActivity: z.boolean(),
  allowMarketing: z.boolean(),
});

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data = updatePreferencesSchema.parse(body);

    await q(
      `UPDATE ${TABLE_PUSH_FCM_TOKENS}
       SET allow_general = $1,
           allow_activity = $2,
           allow_marketing = $3,
           updated_at = NOW()
       WHERE fcm_token = $4`,
      [data.allowGeneral, data.allowActivity, data.allowMarketing, data.fcmToken]
    );

    return NextResponse.json({
      success: true,
      message: 'Preferences updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[FCM Update Preferences Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
