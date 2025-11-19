import { notFound } from 'next/navigation';
import { getKBeautyContent } from '@/content/locales';
import { findSectionBySlug } from '@/content/kBeautySections';
import SectionHero from '@/components/k-beauty/SectionHero';
import SectionContent from '@/components/k-beauty/SectionContent';
import TransparentHeaderWrapper from '@/components/layout/TransparentHeaderWrapper';
import type { KBeautySection } from '@/types/kBeauty';
import BackButton from '@/components/common/BackButton';

interface Props {
  params: {
    locale: string;
    slug: string;
  };
}

// Generate static params for all locale/slug combinations
export async function generateStaticParams() {
  const locales = ['ko', 'en'];
  const slugs = [
    'why-k-beauty-is-best',
    'k-skincare-secret',
    'dermatology-treatments',
    'plastic-surgery-philosophy',
    'science-and-rd',
    'k-culture-impact',
    'beauty-lifestyle',
  ];

  return locales.flatMap((locale) =>
    slugs.map((slug) => ({
      locale,
      slug,
    }))
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: Props) {
  const { locale, slug } = params;
  const content = getKBeautyContent(locale);
  const sectionId = findSectionBySlug(slug);

  if (!sectionId) {
    return {
      title: 'Not Found',
    };
  }

  const sectionEntry = Object.entries(content.sections).find(
    ([_, section]) => (section as any).slug === slug
  );

  if (!sectionEntry) {
    return {
      title: 'Not Found',
    };
  }

  const [sectionKey, section] = sectionEntry;

  const typedSection = section as any as KBeautySection;

  return {
    title: `${typedSection.title || ''} | K-Beauty Guide`,
    description: typedSection.tagline || '',
    openGraph: {
      title: typedSection.title || '',
      description: typedSection.tagline || '',
      images: [typedSection.intro ? `/images/k-beauty/${sectionKey}/hero.jpg` : ''],
    },
  };
}

export default function KBeautySectionPage({ params }: Props) {
  const { locale, slug } = params;
  const content = getKBeautyContent(locale);

  // Find section by slug
  const sectionEntry = Object.entries(content.sections).find(
    ([_, section]) => (section as any).slug === slug
  );

  if (!sectionEntry) {
    notFound();
  }

  const [sectionKey, sectionData] = sectionEntry;
  const section = sectionData as any as KBeautySection;

  // Generate background image path
  const sectionNumber = sectionKey.replace('section', '');

  // Map sections to available images as fallback
  const fallbackImageMap: Record<string, string> = {
    'section1': 'hero.jpg',
    'section2': 'hero.jpg', // Will use section's first image
    'section3': 'hero.jpg',
    'section4': 'hero.jpg',
    'section5': 'hero.jpg',
    'section6': 'hero.jpg',
    'section7': 'hero.jpg',
  };

  const backgroundImagePath = `/images/k-beauty/${sectionKey}-${section.id}/${fallbackImageMap[sectionKey] || 'gangnam-skyline.jpg'}`;

  // Debug: Log the image path
  // console.log('=== K-Beauty Image Debug ===');
  // console.log('Section id:', section.id);
  // console.log('Section Key:', sectionKey);
  // console.log('Section Number:', sectionNumber);
  // console.log('Background Image Path:', backgroundImagePath);
  // console.log('Section Title:', section.title);
  
  // console.log('===========================');

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
