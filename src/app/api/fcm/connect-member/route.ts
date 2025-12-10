import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { q } from '@/lib/db';
import { TABLE_PUSH_FCM_TOKENS } from '@/constants/tables';

const connectSchema = z.object({
  fcmToken: z.string().min(1),
  idUuidMember: z.string().uuid(),
});

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const data = connectSchema.parse(body);

    const result = await q(
      `UPDATE ${TABLE_PUSH_FCM_TOKENS}
       SET id_uuid_member = $1,
           updated_at = NOW()
       WHERE fcm_token = $2
       RETURNING id`,
      [data.idUuidMember, data.fcmToken]
    );

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Token not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Member connected to token',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }

    console.error('[FCM Connect Member Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
