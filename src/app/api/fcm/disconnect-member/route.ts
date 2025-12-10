import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { q } from '@/lib/db';
import { TABLE_PUSH_FCM_TOKENS } from '@/constants/tables';

const disconnectSchema = z.object({
  fcmToken: z.string().min(1),
});

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data = disconnectSchema.parse(body);

    await q(
      `UPDATE ${TABLE_PUSH_FCM_TOKENS}
       SET id_uuid_member = NULL,
           updated_at = NOW()
       WHERE fcm_token = $1`,
      [data.fcmToken]
    );

    return NextResponse.json({
      success: true,
      message: 'Member disconnected from token',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[FCM Disconnect Member Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
