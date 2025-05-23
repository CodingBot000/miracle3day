export const dynamic = "force-dynamic";

import { getBannerAPI } from "@/app/api/home/banner";
import HomeClient from "./HomeClient";
import Beauty from "./components/beauty";
import LocationHospital from "./components/location";
import { LocationEnum, LOCATIONS, LocationType } from "@/constants";
import { cookies } from "next/headers";
import LocationChipSelector from "./LocationChipSelector";
import Link from "next/link";
import { ROUTE } from "@/router";
import Image from "next/image";
import SeeAllLink from "./SeeAllLink";
import LocationHospitalClient from "./components/LocationHospitalClient";
import DiagnosticIntro from "./components/DiagnosticIntro";
import RecommendEventList from "./components/recommend";
import { Smile } from "lucide-react";
import HeroVideos from "./components/hero/HeroVideos";

export default async function HomePage() {
  // const bannerItem = await getBannerAPI();

  // 쿼리스트링 처리 방법  headers/cookies 직접 파싱 (SSR만 가능)
  const cookieStore = cookies();
  const search = cookieStore.get("next-url")?.value ?? ""; 

  const params = new URLSearchParams(search);
  const locationParam = params.get("locationNum");
  console.log('qq qq HomePage locationParam: ', locationParam);
  const selectedLocation: LocationType | undefined = LOCATIONS.find(
    (loc) => loc === locationParam
  );

  return (
    <>
      {/* <HomeClient bannerItem={bannerItem} selectedLocation={selectedLocation} /> */}
      <HeroVideos />
      <section className="max-w-container mx-auto">
        {/* <div className="my-8 leading-6 pl-4 md:pl-6 lg:pl-8">
          <p className="font-bold text-[1.5rem] mb-[5px]">Diagnostic</p>
          <p className="text-[0.8rem]">Ready to get started? I can help you find the right treatment for your skin concerns.</p>
          <p className="text-[0.5rem]">Discover the perfect treatment plan for your skin concerns. Our Al dianostic tool uses advanced image recognition technology to analyze your skin and provide personalized recommendations.</p> */}
          <DiagnosticIntro />
        {/* </div> */}
         
      </section>
      <section className="max-w-container mx-auto mt-20">
        {/* <div className="my-8 leading-6 pl-4 md:pl-6 lg:pl-8">
          <p className="font-bold text-[1.5rem] mb-[5px]">Recommend</p>
          <Link href={ROUTE.EVENT} className="text-sm text-gray-500">View More</Link> */}
          <div className="my-8 px-4 md:px-6 lg:px-8">
        {/* 상단 제목 & 버튼 */}
        <div className="flex items-center justify-between mb-4">
          {/* 왼쪽 텍스트 */}
          <p className="font-bold text-[1.5rem]">Recommend</p>

          {/* 오른쪽 링크 버튼 */}
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
         
      </section>
      <section className="max-w-container mx-auto mt-20">
        <div className="my-8 leading-6 pl-4 md:pl-6 lg:pl-8">
          <p className="font-bold text-[1.5rem] mb-[5px]">New Beauty</p>
          <p className="text-[1.0rem]">Make Attraction</p>
        </div>
         <Beauty />
      </section>
      <section className="max-w-container mx-auto mt-20">
        <div className="my-8 leading-6 pl-4 md:pl-6 lg:pl-8">
          <p className="font-bold text-[1.5rem] mb-[5px]">Hospitals</p>
          <p className="text-[1.0rem]">Choose the location u want</p>
        </div>
        <LocationChipSelector />
        <SeeAllLink location={selectedLocation ?? LocationEnum.Apgujung} />    
        {/* <LocationHospital locationNum={selectedLocation} /> */}
        <LocationHospitalClient />
      </section>
    </>
  );
}
