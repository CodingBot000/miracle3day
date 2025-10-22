import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { query } from '@/server/db';

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

export async function GET() {
  const { userId } = auth();

  if (!userId) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await query(
      `
        SELECT terms_agreements
        FROM public.members
        WHERE clerk_user_id = $1
        LIMIT 1
      `,
      [userId]
    );

    const record = result.rows[0];
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
