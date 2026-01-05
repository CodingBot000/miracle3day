import { NextRequest, NextResponse } from 'next/server';

// Import knowledge base
import koTranslations from '@/app/[locale]/(mobileapp)/(skincare-guide)/i18n/ko.json';
import enTranslations from '@/app/[locale]/(mobileapp)/(skincare-guide)/i18n/en.json';

interface ChatRequest {
  message: string;
  locale: string;
  context?: {
    ageGroup?: string;
    skinType?: string;
    concerns?: string[];
  };
}

interface ChatResponse {
  reply: string;
  sources?: string[];
  suggestions?: string[];
}

// Keyword mappings for topic detection
const TOPIC_KEYWORDS = {
  sunscreen: ['sunscreen', 'spf', 'sun', 'uv', 'protection', '선크림', '자외선', '선스크린', 'SPF'],
  moisturizer: ['moisturizer', 'moisturize', 'hydration', 'dry', '보습', '모이스처라이저', '건조', '수분'],
  cleanser: ['cleanser', 'cleanse', 'wash', 'cleansing', '클렌저', '세안', '클렌징'],
  routine: ['routine', 'order', 'step', 'morning', 'evening', 'night', '루틴', '순서', '모닝', '저녁', '아침'],
  retinoid: ['retinoid', 'retinol', 'vitamin a', '레티놀', '레티노이드', '비타민A'],
  vitaminC: ['vitamin c', 'vitamin-c', 'ascorbic', '비타민C', '비타민 C'],
  acne: ['acne', 'pimple', 'breakout', '여드름', '트러블', '뾰루지'],
  aging: ['aging', 'wrinkle', 'anti-aging', 'fine line', '노화', '주름', '안티에이징', '잔주름'],
  sensitive: ['sensitive', 'irritation', 'redness', '민감', '자극', '홍조'],
  toner: ['toner', 'essence', 'serum', '토너', '에센스', '세럼'],
};

// Get translations helper
function getTranslation(translations: Record<string, unknown>, key: string): string {
  const keys = key.split('.');
  let value: unknown = translations;

  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return '';
    }
  }

  return typeof value === 'string' ? value : '';
}

// Detect topics in message
function detectTopics(message: string): string[] {
  const lowerMessage = message.toLowerCase();
  const topics: string[] = [];

  for (const [topic, keywords] of Object.entries(TOPIC_KEYWORDS)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
      topics.push(topic);
    }
  }

  return topics;
}

// Generate response based on topics
function generateResponse(
  topics: string[],
  translations: Record<string, unknown>,
  locale: string,
  context?: ChatRequest['context']
): ChatResponse {
  const isKo = locale === 'ko';
  const sources: string[] = [];
  const suggestions: string[] = [];
  let reply = '';

  // If no topics detected, provide general guidance
  if (topics.length === 0) {
    reply = isKo
      ? '안녕하세요! 스킨케어에 대해 궁금한 것이 있으시면 질문해주세요. 선크림, 보습, 클렌징, 스킨케어 루틴 등에 대해 도움드릴 수 있습니다.'
      : "Hello! Feel free to ask me about skincare. I can help you with sunscreen, moisturizing, cleansing, skincare routine, and more.";

    suggestions.push(
      isKo ? '선크림은 언제 발라야 하나요?' : 'When should I apply sunscreen?',
      isKo ? '스킨케어 제품 바르는 순서는?' : 'What is the correct skincare routine order?',
      isKo ? '레티놀은 언제 사용하나요?' : 'When should I use retinol?'
    );

    return { reply, sources, suggestions };
  }

  // Build response based on detected topics
  const responses: string[] = [];

  if (topics.includes('sunscreen')) {
    const title = getTranslation(translations, 'guideline.spf_minimum.title');
    const content = getTranslation(translations, 'guideline.spf_minimum.content');
    const reapply = getTranslation(translations, 'guideline.sunscreen_reapply.content');
    const last = getTranslation(translations, 'guideline.sunscreen_last.content');

    if (title && content) {
      responses.push(`**${title}**\n${content}`);
      if (reapply) responses.push(reapply);
      if (last) responses.push(last);
      sources.push('American Academy of Dermatology');
    }

    // Add sensitive skin tip if applicable
    if (context?.skinType === 'sensitive') {
      const sensitiveTip = getTranslation(translations, 'guideline.sensitive_sunscreen.content');
      if (sensitiveTip) responses.push(sensitiveTip);
    }
  }

  if (topics.includes('routine')) {
    const morningTitle = getTranslation(translations, 'guideline.morning_order.title');
    const morningContent = getTranslation(translations, 'guideline.morning_order.content');
    const eveningTitle = getTranslation(translations, 'guideline.evening_order.title');
    const eveningContent = getTranslation(translations, 'guideline.evening_order.content');
    const thinToThick = getTranslation(translations, 'guideline.thin_to_thick.content');

    if (morningTitle && morningContent) {
      responses.push(`**${morningTitle}**\n${morningContent}`);
    }
    if (eveningTitle && eveningContent) {
      responses.push(`**${eveningTitle}**\n${eveningContent}`);
    }
    if (thinToThick) {
      responses.push(thinToThick);
    }
    sources.push('American Academy of Dermatology');
  }

  if (topics.includes('retinoid')) {
    const title = getTranslation(translations, 'guideline.retinoid_evening.title');
    const content = getTranslation(translations, 'guideline.retinoid_evening.content');

    if (title && content) {
      responses.push(`**${title}**\n${content}`);
      sources.push('American Academy of Dermatology');
    }
  }

  if (topics.includes('vitaminC')) {
    const title = getTranslation(translations, 'guideline.vitamin_c_morning.title');
    const content = getTranslation(translations, 'guideline.vitamin_c_morning.content');

    if (title && content) {
      responses.push(`**${title}**\n${content}`);
      sources.push('American Academy of Dermatology');
    }
  }

  if (topics.includes('moisturizer')) {
    if (context?.skinType === 'oily') {
      const content = getTranslation(translations, 'guideline.oily_moisturizer.content');
      if (content) responses.push(content);
    } else if (context?.skinType === 'dry') {
      const content = getTranslation(translations, 'guideline.dry_moisturizer.content');
      if (content) responses.push(content);
    } else {
      const oily = getTranslation(translations, 'guideline.oily_moisturizer.content');
      const dry = getTranslation(translations, 'guideline.dry_moisturizer.content');
      if (oily && dry) {
        responses.push(isKo ? '**지성 피부:** ' + oily : '**Oily skin:** ' + oily);
        responses.push(isKo ? '**건성 피부:** ' + dry : '**Dry skin:** ' + dry);
      }
    }
    sources.push('American Academy of Dermatology');
  }

  if (topics.includes('toner')) {
    const tonerSection = getTranslation(translations, 'article.toner_essence_serum.section.toner.body');
    const essenceSection = getTranslation(translations, 'article.toner_essence_serum.section.essence.body');
    const serumSection = getTranslation(translations, 'article.toner_essence_serum.section.serum.body');
    const needAll = getTranslation(translations, 'article.toner_essence_serum.section.need_all.body');

    if (tonerSection) responses.push(`**${isKo ? '토너' : 'Toner'}**\n${tonerSection}`);
    if (essenceSection) responses.push(`**${isKo ? '에센스' : 'Essence'}**\n${essenceSection}`);
    if (serumSection) responses.push(`**${isKo ? '세럼' : 'Serum'}**\n${serumSection}`);
    if (needAll) responses.push(needAll);
    sources.push('American Academy of Dermatology');
  }

  if (topics.includes('acne') || topics.includes('sensitive')) {
    const patchTest = getTranslation(translations, 'guideline.patch_test.content');
    if (patchTest) {
      responses.push(patchTest);
    }
  }

  // Combine responses
  reply = responses.join('\n\n');

  // Add suggestions for follow-up
  if (!topics.includes('routine')) {
    suggestions.push(isKo ? '스킨케어 제품 바르는 순서는?' : 'What is the correct skincare routine order?');
  }
  if (!topics.includes('sunscreen')) {
    suggestions.push(isKo ? '선크림은 어떻게 발라야 하나요?' : 'How should I apply sunscreen?');
  }
  if (!topics.includes('retinoid')) {
    suggestions.push(isKo ? '레티놀 사용법이 궁금해요' : 'How do I use retinol?');
  }

  return {
    reply: reply || (isKo ? '죄송합니다, 해당 질문에 대한 정보를 찾지 못했습니다.' : "Sorry, I couldn't find information about that topic."),
    sources: Array.from(new Set(sources)),
    suggestions: suggestions.slice(0, 3)
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, locale, context } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const translations = locale === 'ko' ? koTranslations : enTranslations;

    // Detect topics in the message
    const topics = detectTopics(message);

    // Generate response
    const response = generateResponse(topics, translations as Record<string, unknown>, locale, context);

    return NextResponse.json(response);
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
