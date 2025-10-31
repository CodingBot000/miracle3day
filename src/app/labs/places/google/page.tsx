'use client';

import { useState } from 'react';
import { Stars } from '@/components/atoms/Stars';

type PlaceHit = {
  id: string;
  displayName?: { text?: string };
  formattedAddress?: string;
};

type Review = {
  rating?: number;
  text?: { text?: string };
  publishTime?: string;
  authorAttribution?: {
    displayName?: string;
    photoUri?: string;
    uri?: string; // 원문 링크
  };
};

type Details = {
  id: string | null;
  name: string | null;
  address: string | null;
  rating: number | null;
  userRatingCount: number;
  reviews: Review[];
};

export default function GooglePlacesLabPage() {
  const [textQuery, setTextQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [places, setPlaces] = useState<PlaceHit[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string>('');

  const [loadingDetails, setLoadingDetails] = useState(false);
  const [details, setDetails] = useState<Details | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function doSearch() {
    setSearching(true);
    setError(null);
    setPlaces([]);
    setDetails(null);
    try {
      const r = await fetch('/api/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textQuery, languageCode: 'en' })
      });
      const data = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(data));
      setPlaces(data.places ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'search failed');
    } finally {
      setSearching(false);
    }
  }

  async function loadDetails(placeId: string) {
    setLoadingDetails(true);
    setError(null);
    setDetails(null);
    setSelectedPlaceId(placeId);
    try {
      // 현재 브라우저 언어 가져오기
      const uiLang = typeof navigator !== 'undefined' ? navigator.language : 'en'; // 예: 'ko-KR'
      const targetLang = uiLang.split('-')[0].toLowerCase(); // 'ko'

      const r = await fetch(
        `/api/places/details?placeId=${encodeURIComponent(placeId)}&lang=ko&tl=${targetLang}&translate=true`,
        { headers: { 'x-ui-lang': uiLang } }
      );
      const data = await r.json();
      if (!r.ok) throw new Error(JSON.stringify(data));
      setDetails(data);
    } catch (e: any) {
      setError(e?.message ?? 'details failed');
    } finally {
      setLoadingDetails(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Google Places (New v1) 테스트</h1>

      <section className="mb-6 space-y-2">
        <label className="block text-sm">텍스트 검색 (예: 강남역 피부과)</label>
        <div className="flex gap-2">
          <input
            className="border rounded px-3 py-2 flex-1"
            placeholder="텍스트 또는 상호명/주소"
            value={textQuery}
            onChange={(e) => setTextQuery(e.target.value)}
          />
          <button
            className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
            onClick={doSearch}
            disabled={searching || !textQuery.trim()}
          >
            {searching ? '검색중...' : '검색'}
          </button>
        </div>
      </section>

      {error && (
        <div className="mb-6 text-red-600 whitespace-pre-wrap">
          에러: {error}
        </div>
      )}

      {places.length > 0 && (
        <section className="mb-8">
          <h2 className="font-semibold mb-2">검색 결과</h2>
          <ul className="space-y-2">
            {places.map((p: any) => (
              <li key={p.id} className="border rounded p-3">
                <div className="font-medium">{p.displayName?.text ?? '(이름 없음)'}</div>
                <div className="text-sm text-gray-600">{p.formattedAddress}</div>
                <div className="mt-2">
                  <button
                    className="px-3 py-1 text-sm rounded bg-gray-900 text-white"
                    onClick={() => loadDetails(p.id)}
                  >
                    상세 조회
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {selectedPlaceId && (
        <div className="mb-6 text-sm text-gray-700">
          선택한 place_id: <code className="bg-gray-100 px-2 py-1 rounded">{selectedPlaceId}</code>
        </div>
      )}

      {loadingDetails && <div className="mb-6">상세 조회 중...</div>}

      {details && (
        <section className="space-y-4">
          <div className="border rounded p-4">
            <div className="text-lg font-semibold">{details.name ?? ''}</div>
            <div className="text-sm text-gray-600">{details.address}</div>
            <div className="mt-2 flex items-center gap-2">
              {typeof details.rating === 'number' ? (
                <Stars score={details.rating} size={20} />
              ) : (
                <span className="text-sm text-gray-600">평점 정보 없음</span>
              )}
              <span className="text-sm text-gray-600">({details.userRatingCount}개)</span>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">최신 리뷰 (최대 5개)</h3>
            {details.reviews?.length ? (
              <ul className="space-y-3">
                {details.reviews.map((rv, idx) => (
                  <li key={idx} className="border rounded p-3">
                    <div className="flex items-center gap-3">
                      {rv.authorAttribution?.photoUri && (
                        <img
                          src={rv.authorAttribution.photoUri}
                          alt="author"
                          className="w-10 h-10 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">
                          {rv.authorAttribution?.displayName ?? '익명'}
                        </div>
                        {rv.authorAttribution?.uri && (
                          <a
                            className="text-xs text-blue-600 underline"
                            href={rv.authorAttribution.uri}
                            target="_blank"
                            rel="noreferrer"
                          >
                            원문 보기
                          </a>
                        )}
                      </div>
                      <div className="text-sm whitespace-nowrap">
                        {typeof rv.rating === 'number' ? (
                          <Stars score={rv.rating} size={16} showNumber={false} />
                        ) : (
                          '—'
                        )}
                      </div>
                    </div>
                    {rv.publishTime && (
                      <div className="text-xs text-gray-500 mt-1">{new Date(rv.publishTime).toLocaleString()}</div>
                    )}
                    <p className="mt-2 text-sm whitespace-pre-wrap">
                      {rv.text?.text ?? '(내용 없음)'}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-600">리뷰 없음</div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
