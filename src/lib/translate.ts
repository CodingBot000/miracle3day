import he from "he";


type TranslateResult = { index: number; text: string };

export async function translateBatch(
  texts: string[],
  target: string
): Promise<TranslateResult[]> {
  if (!process.env.GOOGLE_TRANSLATE_API_KEY) {
    throw new Error('GOOGLE_TRANSLATE_API_KEY is missing');
  }

  const filtered: { index: number; text: string }[] = [];
  texts.forEach((t, i) => {
    const s = (t ?? '').trim();
    if (s) filtered.push({ index: i, text: s });
  });
  if (filtered.length === 0) return [];

  // Google Translation v2는 q 배열을 지원함
  const res = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        q: filtered.map((x) => x.text),
        target,
        // source 자동 감지(명시 안 함). 필요시 source 지정 가능.
        // format: 'text'
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Translate API error: ${JSON.stringify(data)}`);
  }

const translations = data?.data?.translations ?? [];

  return translations.map((tr: any, i: number) => ({
    index: filtered[i].index,
    text: he.decode(tr?.translatedText ?? filtered[i].text), //
  }));
}
