import type { Metadata } from 'next';
import { getLocale } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: 'K-beauty Guide | Mimotok',
    ko: 'K뷰티 가이드 | 미모톡',
    ja: 'Kビューティーガイド | Mimotok',
    'zh-CN': 'K-beauty指南 | Mimotok',
    'zh-TW': 'K-beauty指南 | Mimotok'
  };

  const descriptions = {
    en: 'Complete guide to Korean beauty treatments and skincare. Discover why K-beauty leads the world.',
    ko: '한국 미용 시술과 스킨케어에 대한 완벽한 가이드. K-뷰티가 세계를 선도하는 이유를 알아보세요.',
    ja: '韓国の美容施術とスキンケアの完全ガイド。Kビューティーが世界をリードする理由を発見してください。',
    'zh-CN': '韩国美容护理和护肤完整指南。发现K-beauty引领世界的原因。',
    'zh-TW': '韓國美容護理和護膚完整指南。發現K-beauty引領世界的原因。'
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    keywords: ['K-beauty', 'Korean beauty', 'skincare', 'dermatology', 'plastic surgery', 'K-beauty guide'],
    authors: [{ name: 'Mimotok' }],
    alternates: {
      canonical: `/${locale}/guide`,
      languages: {
        'en': '/en/guide',
        'ko': '/ko/guide',
        'ja': '/ja/guide',
        'zh-CN': '/zh-CN/guide',
        'zh-TW': '/zh-TW/guide'
      }
    },
    openGraph: {
      title: titles[locale as keyof typeof titles],
      description: descriptions[locale as keyof typeof descriptions],
      type: 'website',
      locale: locale,
      url: `/${locale}/guide`,
      siteName: 'Mimotok',
      images: [
        {
          url: '/images/k-beauty/hero.jpg',
          width: 1200,
          height: 630,
          alt: 'K-beauty Guide'
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: titles[locale as keyof typeof titles],
      description: descriptions[locale as keyof typeof descriptions],
      images: ['/images/k-beauty/hero.jpg']
    }
  };
}

export default function GuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
