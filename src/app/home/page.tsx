export const dynamic = "force-dynamic";


import ClinicListForHome from "./components/clinic_list";
import { LocationEnum, LOCATIONS, LocationType } from "@/constants";
import { cookies } from "next/headers";

import Link from "next/link";
import { ROUTE } from "@/router";
import Image from "next/image";;
import SeeAllLink from "./SeeAllLink";
import LocationHospitalClient from "../deprecated/LocationHospitalClient";
import DiagnosticIntro from "./components/DiagnosticIntro";
import RecommendEventList from "./components/recommend";
import { Smile } from "lucide-react";
import HeroVideos from "./components/hero/HeroVideos";
import CategoryMenu from "@/components/organism/layout/CategoryMenu";
import AgeChecker from "@/components/template/AgeChecker";
import Hero from "./hero";

import ProtocolPage from "../treatment-protocol/treatment-landing-v2/protocol/page";
import TreatmentProtocol from "../treatment-protocol/treatment-landing-v2/TreatmentProtocol";
import ScrollDevicesIntroduce from "./components/ScrollDevicesIntroduce";
import LanguageText from "./LanguageText";
import TreatmentBasedAgeGuide from "../treatment-based-age-guide/page";
import TransparentHeaderWrapper from "@/components/layout/TransparentHeaderWrapper";
import QuizPage from "../gamification/quize/page";
import WhyKoreaButton from "./components/WhyKoreaButton";
import AgeGuideCTA from "../treatment-based-age-guide/components/AgeGuideCTA";
import { getLangFromCookies, Lang, t } from "@/i18n/i18n";
import ReviewScrollSection from "@/app/home/components/ReviewScrollSection";
import BeautyPartners from "../partners/BeautyPartners";

export default async function HomePage() {
  // const bannerItem = await getBannerAPI();

  // 쿼리스트링 처리 방법  headers/cookies 직접 파싱 (SSR만 가능)
  const cookieStore = cookies();
  const search = cookieStore.get("next-url")?.value ?? "";

  const params = new URLSearchParams(search);
  const locationParam = params.get("locationNum");
  const lang: Lang = getLangFromCookies();
  // console.log('qq qq HomePage locationParam: ', locationParam);
  const selectedLocation: LocationType | undefined = LOCATIONS.find(
    (loc) => loc === locationParam
  );

  return (
    <TransparentHeaderWrapper>
      {/* HeroVideos: 모바일은 full-width, 데스크탑은 max-w-[1200px] */}
      <div className="w-full md:max-w-[1200px] md:mx-auto relative z-10">
        <HeroVideos>
          <div className="absolute inset-0 bg-black/15 z-10"></div>
          <div className="absolute inset-0 flex items-end justify-end text-white z-30 pb-6 pr-6 md:pb-12 md:pr-12">
            <div className="text-right">
              <div className="mb-2 md:mb-4">
                <WhyKoreaButton />
              </div>
              <div className="mb-2 md:mb-4">
                <AgeGuideCTA />
              </div>
              <div className="mb-2 md:mb-4">
                <BeautyPartners />
              </div>
              <h1 className="text-xl md:text-3xl lg:text-5xl font-bold drop-shadow-lg">Reveal Your Beauty</h1>
              <p className="mt-2 md:mt-4 text-sm md:text-base lg:text-lg drop-shadow-md">
                  Discover premium skincare <br className="md:hidden" />
                  & wellness experiences
              </p>
            </div>
          </div>
        </HeroVideos>
      </div>

      {/* 본문 컨텐츠: max-w-[1200px]로 제한 */}
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8 min-w-0">
        {/* <section className="max-w-container mx-auto">
          <DiagnosticIntro />
        <div className="my-8 px-4 md:px-6 lg:px-8">
          <CategoryMenu />
        </div>
      </section> */}
              {/* <div className="my-8 px-4 md:px-6 lg:px-8">
          <CategoryMenu />
        </div> */}

          <Hero />
{/* <UploadTestViaServer /> */}
          {/* <MiddleSection1 /> */}

          <TreatmentProtocol />


       {/* See All Clinics Link */}
       <div className="text-right mt-10 px-4">
          <Link
            href="/hospital"
            className="inline-flex items-center gap-1 text-gray-400 hover:text-gray-900 transition-colors text-xl font-medium mb-4"
          >
            {t(lang, "전체 보기", "See All Clinics")}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        <ClinicListForHome />

        {/* Random Reviews Infinite Scroll */}
        <ReviewScrollSection />

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
        {/* <TreatmentBasedAgeGuide /> */}
        {/* <AgeGuideCTA />


        <BeautyPartners /> */}
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
