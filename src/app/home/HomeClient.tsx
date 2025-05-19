"use client";

// import SurgeryBannerGrid, { Banner } from "@/components/organism/layout/Banner";
import SurgeryBannerGrid from "@/components/organism/layout/Banner";
import LocationHospital from "./components/location";
import Beauty from "./components/beauty";
import Hero from "@/components/organism/layout/HeroSection";

import { Chip } from "@/components/atoms/Chip";
import { ROUTE } from "@/router";
import { LocationEnum, LOCATIONS, LocationType } from "@/constants";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import HeroVideos from "./components/hero/HeroVideos";

interface Props {
  bannerItem: Awaited<ReturnType<typeof import("@/app/api/home/banner").getBannerAPI>>;
  selectedLocation: LocationType | undefined;
  // searchParams: { locationNum: string };
}

// export default function HomeClient({ bannerItem, searchParams }: Props) {
//     const { locationNum: locationParam } = searchParams;
// export default function HomeClient({ bannerItem }: { bannerItem: Awaited<ReturnType<typeof import("@/app/api/home/banner").getBannerAPI>> }) {
export default function HomeClient({ bannerItem, selectedLocation }: Props) {
  const searchParams = useSearchParams();
  const locationParam = searchParams.get("locationNum");

    console.log('qq qq locationNum:', locationParam);
    
    const currentLocation: LocationType | undefined =
    LOCATIONS.find((loc) => loc === locationParam) ?? selectedLocation ?? LocationEnum.Apgujung;



    return (
      <main>
        <HeroVideos />
        {/* <Hero /> */}
        {/* <Banner bannerItem={bannerItem.data} /> */}
        {/* <SurgeryBannerGrid /> */}
{/*   
        <section className="max-w-container mx-auto mt-12">
          <div className="my-8 leading-6 pl-4 md:pl-6 lg:pl-8">
            <p className="font-bold text-[2.5rem] mb-[25px]">New Beauty</p>
            <p className="text-[1.2rem]">Make Attraction</p>
          </div>
          <Beauty />
        </section>
  
        <section className="max-w-container mx-auto mt-20">
          <div className="my-8 leading-6 pl-4 md:pl-6 lg:pl-8">
            <p className="font-bold text-[2.5rem] mb-[25px]">Hospitals</p>
            <p className="text-[1.2rem]">Choose the location u want</p>
          </div>
          {renderLocalChip()}
          <LocationHospital locationNum={selectedLocation} />
        </section> */}
      </main>
    );
  }
  