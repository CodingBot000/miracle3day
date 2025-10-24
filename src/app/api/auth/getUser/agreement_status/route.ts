import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth-helper';
import { q } from '@/lib/db';
import { TABLE_MEMBERS } from '@/constants/tables';

export const runtime = 'nodejs';

function evalAgreementStatus(ta: unknown) {
  const missing: string[] = [];
  let satisfied = false;

  if (ta && typeof ta === 'object') {
    const entries = Object.entries(ta as Record<string, any>);
    satisfied = entries.every(([key, v]) => {
      if (!v || typeof v !== 'object') return false;
      const req = v.required === true;
      const ok = v.agreed === true;
      if (req && !ok) missing.push(key);
      return req ? ok : true;
    });
  } else {
    satisfied = false;
  }

  return { satisfied, missing };
}

export async function GET(req: Request) {
  const authSession = await getAuthSession(req);
  if (!authSession) {
    return new NextResponse('Unauthorized', { status: 401 });
  }
  const { userId } = authSession;

  try {
    const rows = await q<{ terms_agreements: unknown }>(
      `
        SELECT terms_agreements
        FROM ${TABLE_MEMBERS}
        WHERE id_uuid = $1
        LIMIT 1
      `,
      [userId]
    );

    const record = rows[0];
    let termsAgreements: unknown = record?.terms_agreements ?? null;

    if (typeof termsAgreements === 'string') {
      try {
        termsAgreements = JSON.parse(termsAgreements);
      } catch {
        termsAgreements = null;
      }
    }

    const status = evalAgreementStatus(termsAgreements);

    return NextResponse.json(status);
  } catch (error) {
    console.error('Failed to fetch agreement status', error);
    return new NextResponse('Failed to fetch agreement status', { status: 500 });
  }
}
