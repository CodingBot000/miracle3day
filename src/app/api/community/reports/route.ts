import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from "@/lib/auth-helper";
import { z } from 'zod';
import { q } from '@/lib/db';
import { TABLE_COMMUNITY_REPORTS } from '@/constants/tables';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

const reportSchema = z.object({
  targetType: z.enum(['post', 'comment']),
  targetId: z.number(),
  reason: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const authSession = await getAuthSession(req); if (!authSession) return NextResponse.json({ error: "Unauthorized" }, { status: 401 }); const { userId } = authSession;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const payload = reportSchema.parse(body);

    const member = await findMemberByUserId(userId);
    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 403 });
    }

    const reporterUuid =
      (member['uuid'] as string | undefined) ??
      (member['id_uuid'] as string | undefined) ??
      userId;

    await q(
      `INSERT INTO ${TABLE_COMMUNITY_REPORTS} (
        type_target,
        id_target,
        uuid_reporter,
        reason,
        created_at
      ) VALUES ($1, $2, $3, $4, now())`,
      [payload.targetType, payload.targetId, reporterUuid, payload.reason]
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('POST /api/community/reports error:', error);
    const message = error instanceof Error ? error.message : 'Failed to submit report';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
