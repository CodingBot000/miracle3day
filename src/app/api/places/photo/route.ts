export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const name = req.nextUrl.searchParams.get('name'); // 예: places/PLACE_ID/photos/XXXX
    const maxWidthPx = req.nextUrl.searchParams.get('maxWidthPx') || '800';
    if (!name) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 });
    }

    const url = new URL(`https://places.googleapis.com/v1/${name}/media`);
    url.searchParams.set('maxWidthPx', maxWidthPx);

    const r = await fetch(url.toString(), {
      headers: { 'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY! }
    });

    if (!r.ok) {
      const err = await r.text();
      return new NextResponse(err, { status: r.status });
    }

    // Google이 바이너리/리다이렉트 응답. 여기서는 스트리밍 반환
    return new NextResponse(r.body, {
      status: 200,
      headers: {
        'Content-Type': r.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=86400'
      }
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown error' }, { status: 500 });
  }
}
