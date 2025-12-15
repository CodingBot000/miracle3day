import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TreatmentAgeGuideClient from '../TreatmentAgeGuideClient';
import {
  generateAgeGroupMetadata,
  generateAgeGroupJsonLd
} from '../treatment-age-guide-metadata';
import {
  getAgeGroupFromSlug,
  ageGroups,
  getSlugFromAgeGroup,
  type AgeGroup
} from '@/constants/treatment/antiaging-agebased/ageGroupUtils';

// Generate metadata for each age group page
export async function generateMetadata({
  params
}: {
  params: { locale: string; ageGroup: string }
}): Promise<Metadata> {
  const ageGroup = getAgeGroupFromSlug(params.ageGroup);

  if (!ageGroup) {
    return {
      title: 'Age Group Not Found | mimotok',
      robots: { index: false, follow: false }
    };
  }

  return generateAgeGroupMetadata(params.locale, ageGroup);
}

// Generate static paths for all age groups
export function generateStaticParams() {
  const locales = ['ko', 'en', 'ja', 'zh-CN', 'zh-TW'];

  return locales.flatMap(locale =>
    ageGroups.map(ageGroup => ({
      locale,
      ageGroup: getSlugFromAgeGroup(ageGroup)
    }))
  );
}

export default function AgeGroupPage({
  params,
}: {
  params: { locale: string; ageGroup: string };
}) {
  const ageGroup = getAgeGroupFromSlug(params.ageGroup);

  // Return 404 for invalid age groups
  if (!ageGroup) {
    notFound();
  }

  const jsonLd = generateAgeGroupJsonLd(params.locale, ageGroup);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TreatmentAgeGuideClient initialAgeGroup={ageGroup} />
    </>
  );
}
