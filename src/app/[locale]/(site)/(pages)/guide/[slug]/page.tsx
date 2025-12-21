import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getKBeautyContent } from '@/locales/content-locale';
import SectionHero from '../k-beauty/SectionHero';
import SectionContent from '../k-beauty/SectionContent';
import TransparentHeaderWrapper from '@/components/layout/TransparentHeaderWrapper';
import type { KBeautySection } from '@/types/kBeauty';
import type { Metadata } from 'next';

interface Props {
  params: {
    slug: string;
  };
}

// Generate static params for all slug combinations
export async function generateStaticParams() {
  const slugs = [
    'why-k-beauty-is-best',
    'k-skincare-secret',
    'dermatology-treatments',
    'plastic-surgery-philosophy',
    'science-and-rd',
    'k-culture-impact',
    'beauty-lifestyle',
  ];

  return slugs.map((slug) => ({ slug }));
}

// Helper type for section data
type SectionData = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  tagline: string;
  intro?: KBeautySection['intro'];
  mainPoints?: KBeautySection['mainPoints'];
  statistics?: KBeautySection['statistics'];
  conclusion?: KBeautySection['conclusion'];
  cta?: KBeautySection['cta'];
};

// Generate metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const locale = await getLocale();
  const content = getKBeautyContent(locale);

  // Find section by slug
  const sectionKeys = ['section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7'] as const;
  let sectionKey: string | null = null;
  let sectionData: SectionData | null = null;

  for (const key of sectionKeys) {
    const section = content.sections[key] as SectionData;
    if (section.slug === slug) {
      sectionKey = key;
      sectionData = section;
      break;
    }
  }

  if (!sectionData || !sectionKey) {
    return {
      title: 'Not Found',
    };
  }

  const imageUrl = `/images/k-beauty/${sectionKey}-${sectionData.id}/hero.jpg`;

  return {
    title: `${sectionData.title} | Mimotok K-beauty Guide`,
    description: sectionData.tagline || sectionData.subtitle || '',
    keywords: ['K-beauty', 'Korean beauty', sectionData.title, 'skincare', 'dermatology', 'plastic surgery'],
    authors: [{ name: 'Mimotok' }],
    alternates: {
      canonical: `/${locale}/guide/${slug}`,
      languages: {
        'en': `/en/guide/${slug}`,
        'ko': `/ko/guide/${slug}`,
        'ja': `/ja/guide/${slug}`,
        'zh-CN': `/zh-CN/guide/${slug}`,
        'zh-TW': `/zh-TW/guide/${slug}`
      }
    },
    openGraph: {
      title: sectionData.title,
      description: sectionData.tagline || sectionData.subtitle || '',
      type: 'article',
      locale: locale,
      url: `/${locale}/guide/${slug}`,
      siteName: 'Mimotok',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: sectionData.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: sectionData.title,
      description: sectionData.tagline || sectionData.subtitle || '',
      images: [imageUrl]
    }
  };
}

export default async function KBeautySectionPage({ params }: Props) {
  const { slug } = params;
  const locale = await getLocale();
  const content = getKBeautyContent(locale);

  // Find section by slug
  const sectionKeys = ['section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7'] as const;
  let sectionKey: string | null = null;
  let section: KBeautySection | null = null;

  for (const key of sectionKeys) {
    const sectionData = content.sections[key] as SectionData;
    if (sectionData.slug === slug) {
      sectionKey = key;
      section = {
        id: sectionData.id,
        slug: sectionData.slug,
        title: sectionData.title,
        subtitle: sectionData.subtitle,
        tagline: sectionData.tagline,
        intro: sectionData.intro,
        mainPoints: sectionData.mainPoints,
        statistics: sectionData.statistics,
        conclusion: sectionData.conclusion,
        cta: sectionData.cta,
      };
      break;
    }
  }

  if (!section || !sectionKey) {
    notFound();
  }

  // Map sections to available images as fallback
  const fallbackImageMap: Record<string, string> = {
    'section1': 'hero.jpg',
    'section2': 'hero.jpg',
    'section3': 'hero.jpg',
    'section4': 'hero.jpg',
    'section5': 'hero.jpg',
    'section6': 'hero.jpg',
    'section7': 'hero.jpg',
  };

  const backgroundImagePath = `/images/k-beauty/${sectionKey}-${section.id}/${fallbackImageMap[sectionKey] || 'gangnam-skyline.jpg'}`;

  return (
    <>
      <div
        id="post-scroll-container"
        className="bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0] overflow-y-auto"
        style={{ zIndex: 1 }}
      >
        <TransparentHeaderWrapper>
          <div className="bg-white pb-20 lg:pb-32">

            <SectionHero
              title={section.title || ''}
              subtitle={section.subtitle || ''}
              tagline={section.tagline || ''}
              backgroundImage={backgroundImagePath}
            />

            <SectionContent
              sectionKey={sectionKey}
              intro={section.intro || {}}
              mainPoints={section.mainPoints || {}}
              statistics={section.statistics}
              conclusion={section.conclusion || { title: '', quote: '', points: [], closingLine: '', image: '' }}
              cta={section.cta}
            />
          </div>
        </TransparentHeaderWrapper>
      </div>
    </>
  );
}
