export const dynamic = "force-dynamic";

import { getTranslations } from 'next-intl/server';
import { Metadata } from 'next';
import { getHomeMetadata } from '@/lib/metadata/homeMetadata';
import HeadSection from "./HeadSection";
import ClinicListForHome from "./components/clinic_list";
import { Link } from "@/i18n/routing";
import ReviewScrollSection from "./components/ReviewScrollSection";
import KBeautyGuideSection from "./components/KBeautyGuideSeciont";
import TrustStatistics from './TrustStatistics';
import HeroVideos from "./components/hero/HeroVideos";
import TransparentHeaderWrapper from "@/components/layout/TransparentHeaderWrapper";

export async function generateMetadata({ 
  params 
}: { 
  params: { locale: string } 
}): Promise<Metadata> {
  return getHomeMetadata(params.locale);
}

export default async function HomePage() {
  const t = await getTranslations('Home');
  const tCommon = await getTranslations('Common');
  
  return (
    <div className="w-full">
      {/* HeroVideos 복원 - overflow 문제 주의 */}
      <div className="w-full relative">
        <HeroVideos>
          <div className="absolute inset-0 bg-black/15 z-10"></div>
          <div className="absolute inset-0 flex items-end justify-end text-white z-30 pb-6 pr-6 md:pb-12 md:pr-12">
            <div className="text-right">
              <h1 className="text-xl md:text-3xl lg:text-5xl font-bold drop-shadow-lg">
                {t('heroTitle')}
              </h1>
              <p className="mt-2 md:mt-4 text-sm md:text-base lg:text-lg drop-shadow-md">
                {t('heroSubtitle')}
              </p>
            </div>
          </div>
        </HeroVideos>
      </div>
      
      {/* 본문 컨텐츠 */}
      <div className="w-full px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* TrustStatistics 복원 - transform 애니메이션 제거됨 */}
        <TrustStatistics />
        
        <HeadSection />
        
        {/* See All Clinics Link */}
        <div className="text-right mt-0 md:mt-0 px-4">
          <Link
            href="/hospital"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors text-xl font-medium mb-4"
          >
            {tCommon('seeMoreClinics')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        <ClinicListForHome />
        
        {/* Random Reviews Infinite Scroll */}
        <ReviewScrollSection />
        
        <div className="mb-2 md:mb-4">
          <KBeautyGuideSection />
        </div>
        
      </div>
    </div>
  );
}