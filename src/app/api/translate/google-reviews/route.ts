/**
 * POST /api/translate/google-reviews
 * Batch translate Google review texts
 */

import { NextRequest, NextResponse } from 'next/server';
import { translateBatch } from '@/providers/translator';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TranslateItem {
  reviewKey: string;
  text: string;
}

interface TranslateRequest {
  targetLang: string;
  items: TranslateItem[];
}

interface TranslateResponse {
  translations: Array<{
    reviewKey: string;
    translated: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json();
    const { targetLang, items } = body;

    // Validate input
    if (!targetLang || typeof targetLang !== 'string') {
      return NextResponse.json(
        { error: 'targetLang is required and must be a string' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: 'items must be an array' },
        { status: 400 }
      );
    }

    // If no items, return empty translations
    if (items.length === 0) {
      return NextResponse.json({ translations: [] });
    }

    // Extract texts for translation
    const textsToTranslate: string[] = [];
    const textIndices: number[] = []; // Track which items have text

    items.forEach((item, index) => {
      const text = (item?.text ?? '').trim();
      if (text.length > 0) {
        textsToTranslate.push(text);
        textIndices.push(index);
      }
    });

    // Translate batch
    const translatedTexts = textsToTranslate.length > 0
      ? await translateBatch(targetLang, textsToTranslate)
      : [];

    // Map translations back to items
    const translations: TranslateResponse['translations'] = items.map((item, index) => {
      const textIndex = textIndices.indexOf(index);
      const translated = textIndex >= 0 ? translatedTexts[textIndex] : '';

      return {
        reviewKey: item.reviewKey,
        translated: translated || '',
      };
    });

    return NextResponse.json({ translations });
  } catch (error) {
    console.error('[POST /api/translate/google-reviews] Error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Translation failed',
      },
      { status: 500 }
    );
  }
}
