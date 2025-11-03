/**
 * Translation provider abstraction
 * Currently uses Google Cloud Translation API
 * Can be easily swapped with DeepL or other providers
 */

interface TranslationResponse {
  data: {
    translations: Array<{
      translatedText: string;
    }>;
  };
}

/**
 * Translate a batch of texts to target language
 * @param targetLang - Target language code (e.g., 'ko', 'en', 'ja')
 * @param texts - Array of texts to translate
 * @returns Array of translated texts (same order as input)
 */
export async function translateBatch(
  targetLang: string,
  texts: string[]
): Promise<string[]> {
  // If no texts to translate, return empty array
  if (texts.length === 0) {
    return [];
  }

  // Filter out empty texts
  const filteredTexts = texts.filter((t) => t.trim().length > 0);
  if (filteredTexts.length === 0) {
    return texts.map(() => '');
  }

  try {
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;

    if (!apiKey) {
      console.error('[translateBatch] Missing GOOGLE_TRANSLATE_API_KEY');
      // Return original texts as fallback
      return texts;
    }

    // Google Cloud Translation API
    const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: filteredTexts,
        target: targetLang,
        format: 'text',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[translateBatch] API error:', response.status, errorText);
      // Return original texts as fallback
      return texts;
    }

    const data: TranslationResponse = await response.json();
    const translations = data.data.translations.map((t) => t.translatedText);

    // Map back to original array (handling empty texts)
    let translationIndex = 0;
    return texts.map((text) => {
      if (text.trim().length === 0) {
        return '';
      }
      return translations[translationIndex++] || text;
    });
  } catch (error) {
    console.error('[translateBatch] Error:', error);
    // Return original texts as fallback
    return texts;
  }
}

/**
 * Detect if translation is needed
 * @param sourceLang - Source language code
 * @param targetLang - Target language code
 * @returns true if translation is needed
 */
export function needsTranslation(sourceLang: string, targetLang: string): boolean {
  // Normalize language codes
  const source = sourceLang.toLowerCase().split('-')[0];
  const target = targetLang.toLowerCase().split('-')[0];

  // If same language, no translation needed
  return source !== target;
}

/**
 * Get browser language code
 * @returns Language code (e.g., 'ko', 'en', 'ja')
 */
export function getBrowserLanguage(): string {
  if (typeof navigator === 'undefined') {
    return 'en';
  }

  const lang = navigator.language || 'en';
  return lang.split('-')[0].toLowerCase();
}
