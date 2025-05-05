import Link from "next/link";
import styles from "./home.module.css";

import { Chip } from "@/components/atoms/chip";
import { locationNames } from "@/constants";
import { ROUTE } from "@/router";
import { getBannerAPI } from "@/app/api/home/banner";

import Beauty from "./components/beauty";

import LocationHospital from "./components/location";
import { Banner } from "@/components/organism/layout/banner";
import { clsx } from "clsx";
import { Hero } from "@/components/organism/layout/hero";
import Image from "next/image";
import HeroVideo from "./components/hero/heroVideo";

export default async function Home({
  searchParams: { locationNum },
}: {
  searchParams: { locationNum: string };
}) {
  const bannerItem = await getBannerAPI();

  const renderLocalChip = () => {
    return (
      <>
      <div className="flex flex-wrap justify-center items-center mx-12 mb-5 gap-2">
        {locationNames.map((name, i) => {
          const selectChipStyle =
            (locationNum === undefined && i === 0) || +locationNum === i;

          return (
            <Link
              className={clsx({
                "select-chip": selectChipStyle,
              })}
              key={name}
              href={`/home?locationNum=${i}`}
              scroll={false}
            >
              <Chip>{name}</Chip>
            </Link>
          );
        })}
         </div>
          <p className="font-bold text-[23px] flex justify-end mr-5">
          <Link
            href={ROUTE.LOCATION_DETAIL("") + locationNames[+locationNum || 0]}
            scroll={true}
          >
            <Image
            src={`/icons/icon_see_all.png`}
            alt="see all"
            width={38}
            height={38}
            />
          </Link>
          </p>
        <br />
    
      </>
    );
  };

  return (
    <main>
      <HeroVideo />
      <Hero />
      <Banner bannerItem={bannerItem.data} />
      <br /><br /><br />
      <section className="max-w-container mx-auto">

        {/* New Beauty */}
        {/* <div className="my-8 text-center leading-6">
          <p className="font-bold text-[2.5rem] mb-[25px]">New Beauty</p>
          <p className="text-[1.2rem]">Make Attraction</p>
        </div> */}
      <div className="my-8 leading-6 pl-4 md:pl-6 lg:pl-8">
          <p className="font-bold text-[2.5rem] mb-[25px]">New Beauty</p>
          <p className="text-[1.2rem]">Make Attraction</p>
        </div>
        <Beauty />
      </section>
      
      <br /><br /><br />
      {/* LocationHospital */}
      <section className="max-w-container mx-auto">
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
