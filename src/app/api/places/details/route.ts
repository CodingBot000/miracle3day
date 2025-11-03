export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { normalizeLang, pickTargetLang } from '@/lib/lang';
import { translateBatch } from '@/lib/translate';

export async function GET(req: NextRequest) {
  try {
    const placeId = req.nextUrl.searchParams.get('placeId');
    const languageCode = req.nextUrl.searchParams.get('lang') || 'ko'; // Places 표시 언어
    const tlParam = req.nextUrl.searchParams.get('tl');                // 번역 타겟 언어
    const translateFlag = (req.nextUrl.searchParams.get('translate') || 'true') === 'true';

    // 새 옵션: 최소 별점/최소 개수 (기본 4.0점 이상, 최소 3개)
    const minRating = Number(req.nextUrl.searchParams.get('minRating') ?? 4);
    const minCount  = Math.max(1, Number(req.nextUrl.searchParams.get('minCount') ?? 3));

    if (!placeId) {
      return NextResponse.json({ error: 'placeId is required' }, { status: 400 });
    }

    // 번역 대상 언어: 쿼리 or 헤더 or 기본값
    const headerUILang = req.headers.get('x-ui-lang') || undefined; // (선택) 프런트에서 전달 가능
    const targetLang = normalizeLang(tlParam || headerUILang) || pickTargetLang(undefined, 'en');

    // v1 Details 호출 (reviews 5개 제한)
    const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`);
    url.searchParams.set('languageCode', languageCode);
    // 주의: reviewsSort는 v1에서 NEWEST만 유효하지만, 환경에 따라 바인딩 오류가 있을 수 있어 수동 정렬로 처리

    const r = await fetch(url.toString(), {
      headers: {
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!,
        'X-Goog-FieldMask': [
          'id',
          'displayName',
          'formattedAddress',
          'rating',
          'userRatingCount',
          'reviews',
          'reviews.rating',
          'reviews.text',
          'reviews.text.text',
          'reviews.text.languageCode',
          'reviews.originalText',
          'reviews.originalText.text',
          'reviews.originalText.languageCode',
          'reviews.publishTime',
          'reviews.authorAttribution',
          'reviews.authorAttribution.displayName',
          'reviews.authorAttribution.photoUri',
          'reviews.authorAttribution.uri'
        ].join(',')
      }
    });

    const data = await r.json();
    if (!r.ok) {
      return NextResponse.json({ error: data }, { status: r.status });
    }

    // 최신순 정렬
    let reviews: any[] = Array.isArray(data.reviews) ? data.reviews.slice() : [];
    reviews.sort((a, b) => {
      const ta = a?.publishTime ? Date.parse(a.publishTime) : 0;
      const tb = b?.publishTime ? Date.parse(b.publishTime) : 0;
      return tb - ta;
    });

    // ★ 별점 필터: 낮은 별점 배제 (+ 텍스트 없는 리뷰도 배제 추천)
    reviews = reviews.filter((rv) => {
      const rating = typeof rv?.rating === 'number' ? rv.rating : 0;
      const text = rv?.text?.text ?? rv?.originalText?.text ?? '';
      return rating >= minRating && text.trim().length > 0;
    });

    // 최대 5개 제한(원 API가 5개까지이므로 체감상 동일) — 필요 없으면 주석 처리
    reviews = reviews.slice(0, 5);

    // 최소 개수 미만이면 빈 배열 반환(섹션 스킵 용이), 상태 플래그 동봉
    if (reviews.length < minCount) {
      return NextResponse.json(
        {
          id: data.id ?? null,
          name: data.displayName?.text ?? null,
          address: data.formattedAddress ?? null,
          rating: data.rating ?? null,
          userRatingCount: data.userRatingCount ?? 0,
          targetLang,
          reviews: [],
          meta: {
            filteredBy: { minRating, minCount },
            insufficient: true,
            availableCount: reviews.length
          }
        },
        { headers: { 'Cache-Control': 'public, max-age=60' } }
      );
    }

    // 번역 대상 수집 (이미 targetLang인 경우 제외)
    type ItemForTranslation = { idx: number; sourceLang: string; text: string };
    const baseTexts: string[] = [];
    const needTranslate: ItemForTranslation[] = [];

    reviews.forEach((rv, idx) => {
      // 표시용 기본 텍스트: 우선 reviews.text.text, 없으면 originalText.text
      const shown = rv?.text?.text ?? rv?.originalText?.text ?? '';
      const shownLang = normalizeLang(rv?.text?.languageCode || rv?.originalText?.languageCode);
      baseTexts[idx] = shown;

      if (translateFlag) {
        const isSameLang = shownLang && normalizeLang(shownLang) === targetLang;
        if (!isSameLang && shown.trim()) {
          needTranslate.push({ idx, sourceLang: shownLang, text: shown });
        }
      }
    });

    // 배치 번역 수행
    const translatedMap = new Map<number, string>();
    if (needTranslate.length > 0) {
      const order = needTranslate.map((x) => x.text);
      const translated = await translateBatch(order, targetLang);
      translated.forEach((tr, i) => {
        const idx = needTranslate[i].idx;
        translatedMap.set(idx, tr.text);
      });
    }

    // 결과 조립: 번역된 텍스트가 있으면 교체, 없으면 원문 유지
    const finalReviews = reviews.map((rv, idx) => {
      const outText =
        translatedMap.has(idx) ? translatedMap.get(idx) : baseTexts[idx];

      return {
        rating: rv?.rating ?? null,
        publishTime: rv?.publishTime ?? null,
        authorAttribution: rv?.authorAttribution ?? null,
        sourceLanguage:
          rv?.text?.languageCode ||
          rv?.originalText?.languageCode ||
          null,
        text: {
          text: outText || '',
          languageCode: translatedMap.has(idx)
            ? targetLang
            : (rv?.text?.languageCode || rv?.originalText?.languageCode || null)
        }
      };
    });

    return NextResponse.json(
      {
        id: data.id ?? null,
        name: data.displayName?.text ?? null,
        address: data.formattedAddress ?? null,
        rating: data.rating ?? null,
        userRatingCount: data.userRatingCount ?? 0,
        targetLang,
        reviews: finalReviews,
        meta: {
          filteredBy: { minRating, minCount },
          insufficient: false,
          availableCount: finalReviews.length
        }
      },
      { headers: { 'Cache-Control': 'public, max-age=60' } }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'unknown error' }, { status: 500 });
  }
}
