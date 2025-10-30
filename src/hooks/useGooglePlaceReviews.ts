import { useQuery } from '@tanstack/react-query';
import { GooglePlaceReviewsResponse } from '@/app/models/reviewData.dto';

// searchKey에서 '|' 앞부분만 추출
function extractSearchQuery(searchKey: string): string {
  if (!searchKey) return '';
  const parts = searchKey.split('|');
  return parts[0].trim();
}

export const useGooglePlaceReviews = (searchKey: string) => {
  return useQuery({
    queryKey: ['googlePlaceReviews', searchKey],
    queryFn: async () => {
      // 1. searchKey에서 검색어 추출
      const textQuery = extractSearchQuery(searchKey);
      if (!textQuery) {
        return null;
      }

      // 2. Places Search API 호출
      const searchResponse = await fetch('/api/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ textQuery, languageCode: 'en' })
      });

      if (!searchResponse.ok) {
        throw new Error('Failed to search place');
      }

      const searchData = await searchResponse.json();
      const places = searchData.places ?? [];

      if (places.length === 0) {
        return null;
      }

      // 3. 첫 번째 결과의 placeId로 상세 정보 조회
      const placeId = places[0].id;
      const uiLang = typeof navigator !== 'undefined' ? navigator.language : 'en';
      const targetLang = uiLang.split('-')[0].toLowerCase();

      const detailsResponse = await fetch(
        `/api/places/details?placeId=${encodeURIComponent(placeId)}&lang=ko&tl=${targetLang}&translate=true`,
        { headers: { 'x-ui-lang': uiLang } }
      );

      if (!detailsResponse.ok) {
        throw new Error('Failed to fetch place details');
      }

      const detailsData: GooglePlaceReviewsResponse = await detailsResponse.json();
      return detailsData;
    },
    enabled: !!searchKey,
    staleTime: 1000 * 60 * 5, // 5분
    retry: 1,
  });
};
