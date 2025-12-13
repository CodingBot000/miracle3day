export const dynamic = "force-dynamic";

import { getTranslations } from 'next-intl/server';
import ClinicListForHome from "./components/clinic_list";
import { LocationEnum, LOCATIONS, LocationType } from "@/constants";
import { cookies } from "next/headers";

import { Link } from "@/i18n/routing";
import { ROUTE } from "@/router";
import Image from "next/image";
import SeeAllLink from "./SeeAllLink";

import DiagnosticIntro from "./components/DiagnosticIntro";
import RecommendEventList from "./components/recommend";
import { Smile } from "lucide-react";
import HeroVideos from "./components/hero/HeroVideos";
import CategoryMenu from "@/components/organism/layout/CategoryMenu";
import AgeChecker from "@/components/template/AgeChecker";
import Hero from "./HeadSection";

import ProtocolPage from "@/app/[locale]/(site)/(pages)/treatment-protocol/treatment-landing-v2/protocol/page";
import TreatmentProtocol from "@/app/[locale]/(site)/(pages)/treatment-protocol/treatment-landing-v2/TreatmentProtocol";
import ScrollDevicesIntroduce from "./components/ScrollDevicesIntroduce";
import LanguageText from "./LanguageText";
import TreatmentBasedAgeGuide from "@/app/[locale]/(site)/(pages)/treatment-based-age-guide/page";
import TransparentHeaderWrapper from "@/components/layout/TransparentHeaderWrapper";
import QuizPage from "@/app/[locale]/(site)/(pages)/gamification/quize/page";
import WhyKoreaButton from "./components/WhyKoreaButton";
import AgeGuideCTA from "@/app/[locale]/(site)/(pages)/treatment-based-age-guide/components/AgeGuideCTA";
import ReviewScrollSection from "./components/ReviewScrollSection";
import BeautyPartners from "@/app/[locale]/(site)/(pages)/partners/BeautyPartners";
import QuestionsView from "@/app/[locale]/(site)/(community)/community/QuestionsView";
import HeadSection from "./HeadSection";
import { motion } from "framer-motion";
import KBeautyGuideSection from "./components/KBeautyGuideSeciont";
import { Metadata } from 'next';
import { getHomeMetadata } from '@/lib/metadata/homeMetadata';

export async function generateMetadata({ 
  params 
}: { 
  params: { locale: string } 
}): Promise<Metadata> {
  return getHomeMetadata(params.locale);
}

export default async function HomePage() {
  // const bannerItem = await getBannerAPI();
  const t = await getTranslations('Home');
  const tCommon = await getTranslations('Common');

  // 쿼리스트링 처리 방법  headers/cookies 직접 파싱 (SSR만 가능)
  const cookieStore = cookies();
  const search = cookieStore.get("next-url")?.value ?? "";

  const params = new URLSearchParams(search);
  const locationParam = params.get("locationNum");
  // log.debug('qq qq HomePage locationParam: ', locationParam);
  const selectedLocation: LocationType | undefined = LOCATIONS.find(
    (loc) => loc === locationParam
  );

  const fadeUp = {
    hidden: { opacity: 0, y: 12 },
    show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <TransparentHeaderWrapper>
      {/* HeroVideos: 부모 레이아웃(1024px)을 따름 */}
      <div className="w-full relative z-10">
        <HeroVideos>
          <div className="absolute inset-0 bg-black/15 z-10"></div>
          <div className="absolute inset-0 flex items-end justify-end text-white z-30 pb-6 pr-6 md:pb-12 md:pr-12">
            <div className="text-right">
              {/* <div className="mb-2 md:mb-4">
                <WhyKoreaButton />
              </div>
              <div className="mb-2 md:mb-4">
                <AgeGuideCTA />
              </div>
              <div className="mb-2 md:mb-4">
                <BeautyPartners />
              </div> */}
              <h1 className="text-xl md:text-3xl lg:text-5xl font-bold drop-shadow-lg">
              {t('heroTitle')}
              </h1>
              <p className="mt-2 md:mt-4 text-sm md:text-base lg:text-lg drop-shadow-md">
                {t('heroSubtitle')}
                  {/* Discover premium skincare <br className="md:hidden" />
                  & wellness experiences */}
              </p>
            </div>
          </div>
        </HeroVideos>
      </div>

      {/* 본문 컨텐츠: 부모 레이아웃(1024px)을 따름 */}
      <div className="w-full px-4 sm:px-6 lg:px-8 min-w-0">
        {/* <section className="max-w-container mx-auto">
          <DiagnosticIntro />
        <div className="my-8 px-4 md:px-6 lg:px-8">
          <CategoryMenu />
        </div>
      </section> */}
              {/* <div className="my-8 px-4 md:px-6 lg:px-8">
          <CategoryMenu />
        </div> */}

          <HeadSection />
{/* <UploadTestViaServer /> */}
          {/* <MiddleSection1 /> */}
          <section className="w-full flex flex-col items-center px-4 md:py-4 rounded-lg mt-10">
        {/* Heading */}
        <div className="text-center mb-6">
          <div className="text-2xl md:text-4xl font-bold tracking-tight">
            {t('hotIssueTitle')}
          </div>
          <div className="text-sm md:text-xl text-gray-500 tracking-tight mt-2">
            {t('hotIssueSubtitle')}
          </div>
        </div>
        {/* 홈에서는 전체 영역 클릭 시 community로 이동 */}
        <Link href="/community?view=questions" className="block w-full cursor-pointer">
          <div className="pointer-events-none">
            <QuestionsView isMainPage={true} />
          </div>
        </Link>

      </section>
          {/* <TreatmentProtocol /> */}


       {/* See All Clinics Link */}
       <div className="text-right mt-10 px-4">
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
                {/* <WhyKoreaButton />
              </div>
              <div className="mb-2 md:mb-4">
                <AgeGuideCTA />
              </div>
              <div className="mb-2 md:mb-4">
                <BeautyPartners />
              </div> */}


          {/* <div className="text-right mt-24 px-4">
            <Link
              href="/treatments_info"
              className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors text-xl font-medium mb-4"
            >
        
              {t(lang, "아름다움의 파트너들", "Your Beauty Partners")}

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
          <div className="w-full flex justify-center">
            <ScrollDevicesIntroduce />
          </div> */}


          {/* <section className="max-w-container mx-auto mt-20">
              <div className="text-center mb-8">
            

            
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dermatology clinics in Korea for foreigners
            </h2>
          </div> */}
            {/* <div className="my-8 leading-6 pl-4 md:pl-6 lg:pl-8">

              <p className="font-bold text-[1.5rem] mb-[5px]">New Beauty</p>

              <p className="text-[1.0rem]">Make Attraction</p>
            </div> */}
     

        {/* </section> */}
        {/* <TreatmentBasedAgeGuide />
         <AgeGuideCTA />


        <BeautyPartners />  */}
      {/* <section className="max-w-container mx-auto mt-20">
            <div className="my-8 px-4 md:px-6 lg:px-8">

        <div className="flex items-center justify-between mb-4">

          <p className="font-bold text-[1.5rem]">Recommend</p>

          <Link
            href={ROUTE.EVENT}
            className="inline-flex items-center gap-1 text-[1.1rem] text-gray-800 font-bold hover:text-primary transition-colors"
          >
            <Smile className="w-5 h-5" />
            View More
          </Link>
        </div>
          <RecommendEventList />
        </div>
      </section> */}

      {/* <section className="max-w-container mx-auto mt-20">
        <div className="my-8 leading-6 pl-4 md:pl-6 lg:pl-8">

          <p className="font-bold text-[1.5rem] mb-[5px]">New Beauty</p>
          <p className="text-[1.0rem]">Make Attraction</p>
        </div>

         <AgeChecker />
      </section> */}


      </div>
    </TransparentHeaderWrapper>
  );
}
