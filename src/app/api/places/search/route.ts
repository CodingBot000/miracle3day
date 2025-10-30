export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

type SearchBody = {
  textQuery?: string;
  languageCode?: string;
};

export async function POST(req: NextRequest) {
  try {
    const { textQuery, languageCode = 'ko' } = (await req.json()) as SearchBody;
    if (!textQuery) {
      return NextResponse.json({ error: 'textQuery is required' }, { status: 400 });
    }

    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!,
        // v1은 FieldMask 필수. 필요한 필드만 받는다.
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress'
      },
      body: JSON.stringify({ textQuery, languageCode })
    });

    const data = await r.json();
    if (!r.ok) {
      return NextResponse.json({ error: data }, { status: r.status });
    }

    return NextResponse.json({ places: data.places ?? [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown error' }, { status: 500 });
  }
}
