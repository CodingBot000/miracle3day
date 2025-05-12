"use client";

import { Banner } from "@/components/organism/layout/banner";
import LocationHospital from "./components/location";
import Beauty from "./components/beauty";
import Hero from "@/components/organism/layout/hero";
import HeroVideo from "./components/hero/heroVideo";
import { Chip } from "@/components/atoms/Chip";
import { ROUTE } from "@/router";
import { locationNames } from "@/constants";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";

interface Props {
  bannerItem: Awaited<ReturnType<typeof import("@/app/api/home/banner").getBannerAPI>>;
  searchParams: { locationNum: string };
}

export default function HomeClient({ bannerItem, searchParams }: Props) {
    const { locationNum } = searchParams;
  
    const renderLocalChip = () => (
      <>
        <div className="flex flex-wrap justify-center items-center mx-12 mb-5 gap-2">
          {locationNames.map((name, i) => {
            const selected = (locationNum === undefined && i === 0) || +locationNum === i;
  
            return (
              <Link
                key={name}
                href={`/home?locationNum=${i}`}
                scroll={false}
                className={clsx({ "select-chip": selected })}
              >
                <Chip>{name}</Chip>
              </Link>
            );
          })}
        </div>
        <p className="font-bold text-[23px] flex justify-end mr-5">
          <Link href={ROUTE.LOCATION_DETAIL("") + locationNames[+locationNum || 0]} scroll={true}>
            <Image src={`/icons/icon_see_all.png`} alt="see all" width={38} height={38} />
          </Link>
        </p>
      </>
    );
  
    return (
      <main>
        <HeroVideo />
        <Hero />
        <Banner bannerItem={bannerItem.data} />
  
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
            <p className="text-[1.2rem]">Choose the region u want</p>
          </div>
          {renderLocalChip()}
          <LocationHospital locationNum={locationNum} />
        </section>
      </main>
    );
  }
  