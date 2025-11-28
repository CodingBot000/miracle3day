import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { findSectionBySlug } from '@/content/kBeautySections';
import SectionHero from '@/components/k-beauty/SectionHero';
import SectionContent from '@/components/k-beauty/SectionContent';
import TransparentHeaderWrapper from '@/components/layout/TransparentHeaderWrapper';
import type { KBeautySection } from '@/types/kBeauty';

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

// Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
  const { slug } = params;
  const t = await getTranslations('KBeauty');
  const sectionId = findSectionBySlug(slug);

  if (!sectionId) {
    return {
      title: 'Not Found',
    };
  }

  // Find section by slug in sections
  const sectionKeys = ['section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7'] as const;
  let sectionKey: string | null = null;
  let section: KBeautySection | null = null;

  for (const key of sectionKeys) {
    const sectionSlug = t.raw(`sections.${key}.slug`) as string;
    if (sectionSlug === slug) {
      sectionKey = key;
      section = {
        id: t.raw(`sections.${key}.id`) as string,
        slug: sectionSlug,
        title: t.raw(`sections.${key}.title`) as string,
        subtitle: t.raw(`sections.${key}.subtitle`) as string,
        tagline: t.raw(`sections.${key}.tagline`) as string,
        intro: t.raw(`sections.${key}.intro`) as KBeautySection['intro'],
        cta: t.raw(`sections.${key}.cta`) as KBeautySection['cta'],
      };
      break;
    }
  }

  if (!section || !sectionKey) {
    return {
      title: 'Not Found',
    };
  }

  return {
    title: `${section.title || ''} | K-Beauty Guide`,
    description: section.tagline || '',
    openGraph: {
      title: section.title || '',
      description: section.tagline || '',
      images: [section.intro ? `/images/k-beauty/${sectionKey}/hero.jpg` : ''],
    },
  };
}

export default async function KBeautySectionPage({ params }: Props) {
  const { slug } = params;
  const t = await getTranslations('KBeauty');

  // Find section by slug
  const sectionKeys = ['section1', 'section2', 'section3', 'section4', 'section5', 'section6', 'section7'] as const;
  let sectionKey: string | null = null;
  let section: KBeautySection | null = null;

  for (const key of sectionKeys) {
    const sectionSlug = t.raw(`sections.${key}.slug`) as string;
    if (sectionSlug === slug) {
      sectionKey = key;
      section = {
        id: t.raw(`sections.${key}.id`) as string,
        slug: sectionSlug,
        title: t.raw(`sections.${key}.title`) as string,
        subtitle: t.raw(`sections.${key}.subtitle`) as string,
        tagline: t.raw(`sections.${key}.tagline`) as string,
        intro: t.raw(`sections.${key}.intro`) as KBeautySection['intro'],
        mainPoints: t.raw(`sections.${key}.mainPoints`) as KBeautySection['mainPoints'],
        statistics: t.raw(`sections.${key}.statistics`) as KBeautySection['statistics'],
        conclusion: t.raw(`sections.${key}.conclusion`) as KBeautySection['conclusion'],
        cta: t.raw(`sections.${key}.cta`) as KBeautySection['cta'],
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
      <style dangerouslySetInnerHTML={{
        __html: `
          html { overflow: hidden !important; }
        `
      }} />
      <div
        id="post-scroll-container"
        className="fixed inset-0 bg-gradient-to-br from-[#FDF5F0] via-white to-[#F8E8E0] overflow-y-auto"
        style={{ zIndex: 1 }}
      >
        <TransparentHeaderWrapper>
          <div className="bg-white">

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
