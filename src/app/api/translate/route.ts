export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { translateBatch } from '@/lib/translate';
import { pickTargetLang } from '@/lib/lang';

type ReqBody = { texts?: string[]; target?: string; uiLang?: string };

export async function POST(req: NextRequest) {
  try {
    const { texts = [], target, uiLang } = (await req.json()) as ReqBody;

    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json({ error: 'texts[] required' }, { status: 400 });
    }

    const finalTarget = (target || pickTargetLang(uiLang, 'en')).toLowerCase();
    const result = await translateBatch(texts, finalTarget);

    return NextResponse.json({ target: finalTarget, result });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown error' }, { status: 500 });
  }
}
