import { generateAgeGuideJsonLd, generateAgeGuideMetadata } from './treatment-age-guide-metadata';
import { Metadata } from 'next';
import TreatmentAgeGuideClient from './TreatmentAgeGuideClient';

// 동적 메타데이터 생성
export async function generateMetadata({
  params
}: {
  params: { locale: string }
}): Promise<Metadata> {
  return generateAgeGuideMetadata(params.locale);
}

// 정적 파라미터 생성 (선택사항 - SSG를 사용하는 경우)
export function generateStaticParams() {
  return [
    { locale: 'ko' },
    { locale: 'en' },
    { locale: 'ja' },
    { locale: 'zh-CN' },
    { locale: 'zh-TW' }
  ];
}

export default function TreatmentBasedAgeGuide({
  params,
}: {
  params: { locale: string };
}) {
  const jsonLd = generateAgeGuideJsonLd(params.locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Landing page showing default age group 30s */}
      <TreatmentAgeGuideClient initialAgeGroup="30s" />
    </>
  );
}
