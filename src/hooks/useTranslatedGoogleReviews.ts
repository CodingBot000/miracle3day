/**
 * Hook to translate Google reviews in batch
 * Uses React Query for caching to avoid duplicate API calls
 */

import { useQuery } from '@tanstack/react-query';
import crypto from 'crypto';
import { ReviewDataFromGoogleMap } from '@/app/models/reviewData.dto';

// ============================================================================
// Types
// ============================================================================

export interface TranslatedReview extends ReviewDataFromGoogleMap {
  translatedText?: string;
  reviewKey: string; // For tracking
}

interface UseTranslatedGoogleReviewsParams {
  hospitalId: string;
  targetLang: string;
  reviews: ReviewDataFromGoogleMap[];
  enabled?: boolean;
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Generate a stable hash for review keys
 */
function generateKeysHash(reviewKeys: string[]): string {
  const sorted = [...reviewKeys].sort().join(',');
  return crypto.createHash('md5').update(sorted).digest('hex');
}

/**
 * Generate review key from review data
 */
function generateReviewKey(review: ReviewDataFromGoogleMap, index: number): string {
  const authorUri = review.authorAttribution?.uri || '';
  const publishTime = review.publishTime || '';
  const content = `${authorUri}|${publishTime}|${index}`;
  return crypto.createHash('md5').update(content).digest('hex');
}

// ============================================================================
// Main Hook
// ============================================================================

/**
 * Translate Google reviews to target language
 * @param hospitalId - Hospital UUID
 * @param targetLang - Target language code (e.g., 'ko', 'en', 'ja')
 * @param reviews - Original reviews from Google Places
 * @param enabled - Whether to enable the query (default: true)
 * @returns Translated reviews with translatedText field
 */
export function useTranslatedGoogleReviews(params: UseTranslatedGoogleReviewsParams) {
  const { hospitalId, targetLang, reviews, enabled = true } = params;

  // Prepare items for translation
  const reviewsWithKeys = reviews.map((review, index) => ({
    ...review,
    reviewKey: generateReviewKey(review, index),
  }));

  const items = reviewsWithKeys
    .filter((r) => {
      const text = r.text?.text ?? '';
      return text.trim().length > 0;
    })
    .map((r) => ({
      reviewKey: r.reviewKey,
      text: (r.text?.text ?? '').trim(),
    }));

  // Generate stable cache key
  const keysHash = generateKeysHash(items.map((i) => i.reviewKey));

  return useQuery({
    queryKey: ['translatedGoogleReviews', hospitalId, targetLang, keysHash],
    queryFn: async (): Promise<TranslatedReview[]> => {
      // If no items to translate, return original reviews
      if (items.length === 0) {
        return reviewsWithKeys;
      }

      // Call translation API
      const response = await fetch('/api/translate/google-reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLang,
          items,
        }),
      });

      if (!response.ok) {
        console.error('[useTranslatedGoogleReviews] Translation API failed:', response.status);
        // Fallback to original reviews
        return reviewsWithKeys;
      }

      const data = await response.json();
      const translationMap = new Map<string, string>();

      for (const t of data.translations || []) {
        if (t.translated && t.translated.trim().length > 0) {
          translationMap.set(t.reviewKey, t.translated);
        }
      }

      // Merge translations with original reviews
      return reviewsWithKeys.map((review) => ({
        ...review,
        translatedText: translationMap.get(review.reviewKey) || review.text?.text || '',
      }));
    },
    enabled: enabled && reviews.length > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
    retry: 1,
  });
}

/**
 * Get target language from browser
 */
export function getTargetLanguage(): string {
  if (typeof navigator === 'undefined') {
    return 'en';
  }

  const uiLang = navigator.language || 'en';
  return uiLang.split('-')[0].toLowerCase();
}
