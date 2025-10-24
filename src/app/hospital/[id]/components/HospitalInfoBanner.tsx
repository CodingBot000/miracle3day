"use client";

import SlideImg from "@/components/molecules/SlideImg";
import Image from "next/image";;

interface SlideImgProps {
  imageurls: string[];
}

export const HospitalInfoBanner = ({ imageurls }: SlideImgProps) => {
  return (
    <SlideImg imageurls={imageurls}>
      {(item) => (
        <div className="relative w-full aspect-[3/1] max-w-[1200px] max-h-[800px] mx-auto overflow-hidden md:aspect-[3/1] md:max-h-[800px] md:h-auto h-[60vw]">
          <Image fill src={item} alt="" className="object-cover w-full h-full" />
        </div>
      )}
    </SlideImg>
  );
};
