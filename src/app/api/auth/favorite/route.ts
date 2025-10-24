import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-helper';
import { LIMIT } from './constant';
import { q } from '@/lib/db';
import { TABLE_FAVORITE, TABLE_HOSPITAL } from '@/constants/tables';
import { findMemberByUserId } from '@/app/api/auth/getUser/member.helper';

function resolveMemberUuid(member: Record<string, any> | null, fallback: string) {
  return (
    (member?.uuid as string | undefined) ??
    (member?.id_uuid as string | undefined) ??
    (member?.user_id as string | undefined) ??
    fallback
  );
}

export async function GET(req: Request) {
  const authSession = await getAuthSession(req);
  if (!authSession) {
    return NextResponse.json({ favorite: [], nextCursor: false }, { status: 401 });
  }
  const { userId } = authSession;

  const member = await findMemberByUserId(userId);
  const memberUuid = resolveMemberUuid(member, userId);

  const { searchParams } = new URL(req.url);
  const pageParam = Number(searchParams.get('pageParam') ?? '0');
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 0;
  const offset = page * LIMIT;

  try {
    const favorites = await q(
      `SELECT f.*, json_build_object(
          'name', h.name,
          'imageurls', h.imageurls,
          'id_unique', h.id_unique
        ) AS hospital
       FROM ${TABLE_FAVORITE} f
       LEFT JOIN ${TABLE_HOSPITAL} h ON h.id_unique = f.id_hospital
       WHERE f.uuid = $1
       ORDER BY f.created_at DESC
       LIMIT $2 OFFSET $3`,
      [memberUuid, LIMIT, offset]
    );

    const countRows = await q<{ count: number }>(
      `SELECT COUNT(*)::int AS count FROM ${TABLE_FAVORITE} WHERE uuid = $1`,
      [memberUuid]
    );

    const total = countRows[0]?.count ?? 0;
    const nextCursor = offset + favorites.length < total;

    return NextResponse.json({ favorite: favorites, nextCursor });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch favorites';
    console.error('GET /api/auth/favorite error:', error);
    return NextResponse.json({ favorite: [], nextCursor: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authSession = await getAuthSession(req);
  if (!authSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { userId } = authSession;

  const body = await req.json();
  const idHospital = body?.id_hospital;

  if (!idHospital) {
    return NextResponse.json({ error: 'id_hospital is required' }, { status: 400 });
  }

  const member = await findMemberByUserId(userId);
  const memberUuid = resolveMemberUuid(member, userId);

  try {
    const numericId = Number(idHospital);
    if (!Number.isFinite(numericId)) {
      return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
    }

    const existing = await q(
      `SELECT 1 FROM ${TABLE_FAVORITE} WHERE uuid = $1 AND id_hospital = $2 LIMIT 1`,
      [memberUuid, numericId]
    );

    if (existing.length) {
      return NextResponse.json({ error: 'already favorited' }, { status: 409 });
    }

    await q(
      `INSERT INTO ${TABLE_FAVORITE} (uuid, id_hospital, created_at, updated_at)
       VALUES ($1, $2, now(), now())`,
      [memberUuid, numericId]
    );

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create favorite';
    console.error('POST /api/auth/favorite error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const authSession = await getAuthSession(req);
  if (!authSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { userId } = authSession;

  const member = await findMemberByUserId(userId);
  const memberUuid = resolveMemberUuid(member, userId);

  const body = await req.json();
  const rawId = body?.id_hospital;

  if (!rawId) {
    return NextResponse.json({ error: 'id_hospital is required' }, { status: 400 });
  }

  const collectRawIds = Array.isArray(rawId) ? rawId : [rawId];
  const numericIds = collectRawIds
    .map((value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    })
    .filter((value): value is number => value !== null);

  try {
    if (!numericIds.length) {
      return NextResponse.json({ ok: true, skipped: true }, { status: 200 });
    }

    const result = await q(
      `DELETE FROM ${TABLE_FAVORITE}
       WHERE uuid = $1 AND id_hospital = ANY($2::int[])
       RETURNING *`,
      [memberUuid, numericIds]
    );

    if (!result.length) {
      return NextResponse.json({ error: 'No rows deleted' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, deleted: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete favorite';
    console.error('DELETE /api/auth/favorite error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
