import { Metadata } from 'next';

// 다국어 메타데이터 생성 함수
export function generateAgeGuideMetadata(locale: string): Metadata {
  const metadataByLocale: Record<string, {
    title: string;
    description: string;
    keywords: string[];
  }> = {
    ko: {
      title: '연령대별 안티에이징 가이드 | 20대~70대+ 맞춤 피부관리 | mimotok',
      description: '20대부터 70대 이상까지 연령별 맞춤 안티에이징 치료 가이드. 각 연령대의 피부 고민사항, 추천 시술, 피부타입별 케어 방법을 확인하세요. 스킨부스터, 레이저토닝, 리프팅, 필러 등 전문 시술 정보 제공.',
      keywords: [
        '안티에이징',
        '연령대별 피부관리',
        '20대 피부관리',
        '30대 안티에이징',
        '40대 리프팅',
        '50대 주름관리',
        '60대 피부시술',
        '70대 피부관리',
        '스킨부스터',
        '레이저토닝',
        '보톡스',
        '필러',
        '리프팅',
        '피코토닝',
        '프락셀',
        '하이푸',
        '실리프팅',
        '지방이식',
        '피부타입별 관리',
        '맞춤 피부시술',
        'K-뷰티',
        '한국 피부과',
        '피부 전문의',
        'mimotok',
        '미모톡',
      ],
    },
    en: {
      title: 'Age-Based Anti-Aging Guide | Customized Skincare for 20s-70s+ | mimotok',
      description: 'Comprehensive anti-aging treatment guide tailored to your age from 20s to 70s+. Discover age-specific skin concerns, recommended procedures, and skincare tips. Expert guidance on skin boosters, laser toning, lifting, fillers, and more.',
      keywords: [
        'anti-aging',
        'age-based skincare',
        'skincare by age',
        '20s skincare',
        '30s anti-aging',
        '40s lifting',
        '50s wrinkle treatment',
        '60s skin procedures',
        '70s skincare',
        'skin booster',
        'laser toning',
        'botox',
        'filler',
        'face lift',
        'pico toning',
        'fraxel',
        'HIFU',
        'thread lift',
        'fat grafting',
        'skin type care',
        'customized treatment',
        'K-beauty',
        'Korean dermatology',
        'medical aesthetics',
        'mimotok',
      ],
    },
    ja: {
      title: '年齢別アンチエイジングガイド | 20代~70代+カスタムスキンケア | mimotok',
      description: '20代から70代以上まで、年齢に合わせた包括的なアンチエイジング治療ガイド。年齢別の肌の悩み、推奨施術、スキンケアのコツをご紹介。スキンブースター、レーザートーニング、リフティング、フィラーなどの専門情報を提供。',
      keywords: [
        'アンチエイジング',
        '年齢別スキンケア',
        '20代スキンケア',
        '30代アンチエイジング',
        '40代リフティング',
        '50代しわ治療',
        '60代肌施術',
        '70代スキンケア',
        'スキンブースター',
        'レーザートーニング',
        'ボトックス',
        'フィラー',
        'フェイスリフト',
        'ピコトーニング',
        'フラクセル',
        'ハイフ',
        '糸リフト',
        '脂肪移植',
        '肌タイプ別ケア',
        'カスタム治療',
        'Kビューティー',
        '韓国皮膚科',
        '美容医療',
        'mimotok',
        'ミモトク',
      ],
    },
    'zh-CN': {
      title: '年龄段抗衰老指南 | 20-70岁+定制护肤 | mimotok',
      description: '从20多岁到70岁以上的综合抗衰老治疗指南。发现各年龄段的肌肤烦恼、推荐治疗和护肤技巧。提供皮肤促进剂、激光美白、提升、填充剂等专家指导。',
      keywords: [
        '抗衰老',
        '年龄段护肤',
        '20多岁护肤',
        '30多岁抗衰老',
        '40多岁提升',
        '50多岁皱纹治疗',
        '60多岁皮肤治疗',
        '70多岁护肤',
        '皮肤促进剂',
        '激光美白',
        '肉毒素',
        '填充剂',
        '拉皮',
        '皮秒美白',
        '点阵激光',
        '超声刀',
        '线雕',
        '脂肪移植',
        '肤质护理',
        '定制治疗',
        'K美容',
        '韩国皮肤科',
        '医美',
        'mimotok',
      ],
    },
    'zh-TW': {
      title: '年齡段抗衰老指南 | 20-70歲+定製護膚 | mimotok',
      description: '從20多歲到70歲以上的綜合抗衰老治療指南。發現各年齡段的肌膚煩惱、推薦治療和護膚技巧。提供皮膚促進劑、激光美白、提升、填充劑等專家指導。',
      keywords: [
        '抗衰老',
        '年齡段護膚',
        '20多歲護膚',
        '30多歲抗衰老',
        '40多歲提升',
        '50多歲皺紋治療',
        '60多歲皮膚治療',
        '70多歲護膚',
        '皮膚促進劑',
        '激光美白',
        '肉毒素',
        '填充劑',
        '拉皮',
        '皮秒美白',
        '點陣激光',
        '超音波刀',
        '線雕',
        '脂肪移植',
        '膚質護理',
        '定製治療',
        'K美容',
        '韓國皮膚科',
        '醫美',
        'mimotok',
      ],
    },
  };

  const metadata = metadataByLocale[locale] || metadataByLocale.en;

  return {
    title: metadata.title,
    description: metadata.description,
    keywords: metadata.keywords,
    
    // Open Graph
    openGraph: {
      type: 'website',
      locale: locale === 'ko' ? 'ko_KR' : 
              locale === 'ja' ? 'ja_JP' :
              locale === 'zh-CN' ? 'zh_CN' :
              locale === 'zh-TW' ? 'zh_TW' : 'en_US',
      title: metadata.title,
      description: metadata.description,
      siteName: 'mimotok',
      images: [
        {
          url: '/anti_ange_guide/hero/antiage_guide_og_image.jpg',
          width: 1200,
          height: 630,
          alt: 'Age-Based Anti-Aging Guide',
        },
      ],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      images: ['/anti_ange_guide/hero/antiage_guide_og_image.jpg'],
    },

    // Additional metadata
    alternates: {
      canonical: `https://mimotok.com/${locale}/treatment/antiaging-guide`,
      languages: {
        'ko': 'https://mimotok.com/ko/treatment/antiaging-guide',
        'en': 'https://mimotok.com/en/treatment/antiaging-guide',
        'ja': 'https://mimotok.com/ja/treatment/antiaging-guide',
        'zh-CN': 'https://mimotok.com/zh-CN/treatment/antiaging-guide',
        'zh-TW': 'https://mimotok.com/zh-TW/treatment/antiaging-guide',
      },
    },

    // Robots
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification (필요시 추가)
    // verification: {
    //   google: 'your-google-verification-code',
    //   yandex: 'your-yandex-verification-code',
    // },
  };
}

// 페이지 컴포넌트에서 사용할 예시 (page.tsx)
/*
import { generateAgeGuideMetadata } from './metadata';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  return generateAgeGuideMetadata(params.locale);
}

// 또는 정적으로 사용
export const metadata = generateAgeGuideMetadata('ko');
*/

// JSON-LD 구조화된 데이터 생성 함수
export function generateAgeGuideJsonLd(locale: string) {
  const titleByLocale: Record<string, string> = {
    ko: '연령대별 안티에이징 가이드',
    en: 'Age-Based Anti-Aging Guide',
    ja: '年齢別アンチエイジングガイド',
    'zh-CN': '年龄段抗衰老指南',
    'zh-TW': '年齡段抗衰老指南',
  };

  const descriptionByLocale: Record<string, string> = {
    ko: '20대부터 70대 이상까지 연령별 맞춤 안티에이징 치료 가이드',
    en: 'Comprehensive anti-aging treatment guide tailored to your age from 20s to 70s+',
    ja: '20代から70代以上まで、年齢に合わせた包括的なアンチエイジング治療ガイド',
    'zh-CN': '从20多岁到70岁以上的综合抗衰老治疗指南',
    'zh-TW': '從20多歲到70歲以上的綜合抗衰老治療指南',
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: titleByLocale[locale] || titleByLocale.en,
    description: descriptionByLocale[locale] || descriptionByLocale.en,
    url: `https://mimotok.com/${locale}/treatment/antiaging-guide`,
    inLanguage: locale,
    about: {
      '@type': 'MedicalCondition',
      name: 'Skin Aging',
    },
    audience: {
      '@type': 'MedicalAudience',
      audienceType: 'Patient',
    },
    publisher: {
      '@type': 'Organization',
      name: 'mimotok',
      url: 'https://mimotok.com',
    },
    datePublished: '2024-12-15',
    dateModified: new Date().toISOString().split('T')[0],
    mainEntity: {
      '@type': 'MedicalGuidelineContraindication',
      guidelineSubject: {
        '@type': 'MedicalTherapy',
        name: 'Anti-Aging Treatment',
      },
    },
  };
}

// 컴포넌트에서 JSON-LD 사용 예시
/*
export default function Page({ params }: { params: { locale: string } }) {
  const jsonLd = generateAgeGuideJsonLd(params.locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <YourPageContent />
    </>
  );
}
*/

// ====== Age-Specific Metadata Functions ======

import { ageBasedData } from '@/constants/treatment/antiaging-agebased';
import type { AgeGroup } from '@/constants/treatment/antiaging-agebased/ageGroupUtils';

// 연령대별 메타데이터 생성 함수
export function generateAgeGroupMetadata(
  locale: string,
  ageGroup: AgeGroup
): Metadata {
  const localeKey = locale as 'ko' | 'en' | 'ja' | 'zh-CN' | 'zh-TW';
  const ageData = ageBasedData[localeKey]?.find(
    item => item.age_group === ageGroup
  );

  if (!ageData) {
    return generateAgeGuideMetadata(locale);
  }

  const isKorean = locale === 'ko';
  const baseTitle = isKorean ? '연령대별 안티에이징 가이드' : 'Age-Based Anti-Aging Guide';

  return {
    title: `${ageData.title} | ${baseTitle} | mimotok`,
    description: ageData.subtitle,
    keywords: isKorean ? [
      `${ageGroup} 피부관리`,
      `${ageGroup} 안티에이징`,
      ageData.title,
      '안티에이징',
      '피부 시술',
      '맞춤 피부관리',
      'mimotok',
    ] : [
      `${ageGroup} skincare`,
      `${ageGroup} anti-aging`,
      ageData.title,
      'anti-aging',
      'skin treatment',
      'customized skincare',
      'mimotok',
    ],

    openGraph: {
      type: 'article',
      locale: locale === 'ko' ? 'ko_KR' :
              locale === 'ja' ? 'ja_JP' :
              locale === 'zh-CN' ? 'zh_CN' :
              locale === 'zh-TW' ? 'zh_TW' : 'en_US',
      title: `${ageData.title} | ${baseTitle}`,
      description: ageData.subtitle,
      siteName: 'mimotok',
      images: ageData.heroImage ? [
        {
          url: ageData.heroImage,
          width: 1200,
          height: 630,
          alt: ageData.title,
        },
      ] : undefined,
    },

    twitter: {
      card: 'summary_large_image',
      title: `${ageData.title} | ${baseTitle}`,
      description: ageData.subtitle,
      images: ageData.heroImage ? [ageData.heroImage] : undefined,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

// 연령대별 JSON-LD 생성 함수
export function generateAgeGroupJsonLd(
  locale: string,
  ageGroup: AgeGroup
): object {
  const localeKey = locale as 'ko' | 'en' | 'ja' | 'zh-CN' | 'zh-TW';
  const ageData = ageBasedData[localeKey]?.find(
    item => item.age_group === ageGroup
  );

  if (!ageData) {
    return generateAgeGuideJsonLd(locale);
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: ageData.title,
    description: ageData.subtitle,
    inLanguage: locale,
    mainEntity: {
      '@type': 'MedicalCondition',
      name: `Anti-aging treatments for ${ageGroup}`,
      description: ageData.intro,
    },
    about: {
      '@type': 'MedicalTherapy',
      name: ageData.title,
      description: ageData.subtitle,
    },
    audience: {
      '@type': 'MedicalAudience',
      audienceType: 'Patient',
      suggestedAge: {
        '@type': 'QuantitativeValue',
        value: ageGroup,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'mimotok',
      url: 'https://mimotok.com',
    },
    datePublished: '2024-12-15',
    dateModified: new Date().toISOString().split('T')[0],
  };
}
